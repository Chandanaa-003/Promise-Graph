import re
from datetime import datetime, timedelta
from typing import Optional, Tuple


WEEKDAYS = {
    "monday": 0,
    "mon": 0,
    "tuesday": 1,
    "tue": 1,
    "tues": 1,
    "wednesday": 2,
    "wed": 2,
    "thursday": 3,
    "thu": 3,
    "thur": 3,
    "thurs": 3,
    "friday": 4,
    "fri": 4,
    "saturday": 5,
    "sat": 5,
    "sunday": 6,
    "sun": 6,
}

MONTHS = {
    "january": 1, "jan": 1,
    "february": 2, "feb": 2,
    "march": 3, "mar": 3,
    "april": 4, "apr": 4,
    "may": 5,
    "june": 6, "jun": 6,
    "july": 7, "jul": 7,
    "august": 8, "aug": 8,
    "september": 9, "sep": 9, "sept": 9,
    "october": 10, "oct": 10,
    "november": 11, "nov": 11,
    "december": 12, "dec": 12,
}


def _extract_time_of_day(text: str) -> Optional[Tuple[int, int]]:
    """Extract hour and minute from strings like '5 PM', '5:30 pm', '09:00', 'morning'."""
    text_lower = text.lower()

    # 12-hour format with am/pm: '5:30 pm', '5pm', '5:30am'
    match_12h = re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", text_lower)
    if match_12h:
        hour = int(match_12h.group(1))
        minute = int(match_12h.group(2)) if match_12h.group(2) else 0
        meridiem = match_12h.group(3)
        if meridiem == "pm" and hour != 12:
            hour += 12
        elif meridiem == "am" and hour == 12:
            hour = 0
        return hour, minute

    # 24-hour format: '17:00', '09:30'
    match_24h = re.search(r"\b([01]?\d|2[0-3]):([0-5]\d)\b", text_lower)
    if match_24h:
        return int(match_24h.group(1)), int(match_24h.group(2))

    # Named periods
    if "morning" in text_lower:
        return 9, 0
    if "afternoon" in text_lower:
        return 14, 0
    if "evening" in text_lower:
        return 18, 0
    if "night" in text_lower:
        return 21, 0
    if "eod" in text_lower or "end of day" in text_lower or "close of business" in text_lower or "cob" in text_lower:
        return 17, 0

    return None


def normalize_deadline(
    deadline_phrase: Optional[str],
    base_time: Optional[datetime] = None,
) -> Optional[datetime]:
    """
    Deterministically converts an informal deadline phrase into a concrete UTC-naive datetime.
    Uses base_time (usually the reference message timestamp) as anchor.
    Returns None if phrase is None, empty, or cannot be parsed.
    """
    if not deadline_phrase or not deadline_phrase.strip():
        return None

    clean = deadline_phrase.strip().lower()

    if not base_time:
        base_time = datetime.utcnow()
    elif base_time.tzinfo is not None:
        base_time = base_time.replace(tzinfo=None)

    # Default time for deadlines when not explicitly specified is 17:00 (5:00 PM)
    time_info = _extract_time_of_day(clean)
    default_hour = time_info[0] if time_info else 17
    default_min = time_info[1] if time_info else 0

    # 1. "Today" / "Tonight" / "End of day" / "EOD"
    if re.search(r"\b(today|tonight|eod|end of (the )?day|cob|close of business)\b", clean):
        target_date = base_time.date()
        if "tonight" in clean and not time_info:
            default_hour = 21
        return datetime(target_date.year, target_date.month, target_date.day, default_hour, default_min)

    # 2. "Tomorrow"
    if "tomorrow" in clean:
        target_date = base_time.date() + timedelta(days=1)
        return datetime(target_date.year, target_date.month, target_date.day, default_hour, default_min)

    # 3. "In X days / weeks / hours"
    match_in_days = re.search(r"\bin\s+(\d+)\s+day[s]?\b", clean)
    if match_in_days:
        days = int(match_in_days.group(1))
        target_date = base_time.date() + timedelta(days=days)
        return datetime(target_date.year, target_date.month, target_date.day, default_hour, default_min)

    match_in_weeks = re.search(r"\bin\s+(\d+)\s+week[s]?\b", clean)
    if match_in_weeks:
        weeks = int(match_in_weeks.group(1))
        target_date = base_time.date() + timedelta(days=weeks * 7)
        return datetime(target_date.year, target_date.month, target_date.day, default_hour, default_min)

    match_in_hours = re.search(r"\bin\s+(\d+)\s+hour[s]?\b", clean)
    if match_in_hours:
        hours = int(match_in_hours.group(1))
        return base_time + timedelta(hours=hours)

    # 4. Explicit ISO date: YYYY-MM-DD
    match_iso = re.search(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b", clean)
    if match_iso:
        year, month, day = int(match_iso.group(1)), int(match_iso.group(2)), int(match_iso.group(3))
        try:
            return datetime(year, month, day, default_hour, default_min)
        except ValueError:
            pass

    # 5. Month name + day: "Nov 28", "November 28th", "28 Nov"
    for m_name, m_num in MONTHS.items():
        # Match 'November 28' or 'Nov 28th'
        pattern1 = rf"\b{m_name}\s+(\d{{1,2}})(?:st|nd|rd|th)?\b"
        match_m1 = re.search(pattern1, clean)
        if match_m1:
            day = int(match_m1.group(1))
            year = base_time.year
            # If the date has already passed in the current year by more than 30 days, assume next year
            try:
                candidate = datetime(year, m_num, day, default_hour, default_min)
                if candidate < base_time - timedelta(days=30):
                    candidate = datetime(year + 1, m_num, day, default_hour, default_min)
                return candidate
            except ValueError:
                pass

        # Match '28th November' or '28 Nov'
        pattern2 = rf"\b(\d{{1,2}})(?:st|nd|rd|th)?\s+{m_name}\b"
        match_m2 = re.search(pattern2, clean)
        if match_m2:
            day = int(match_m2.group(1))
            year = base_time.year
            try:
                candidate = datetime(year, m_num, day, default_hour, default_min)
                if candidate < base_time - timedelta(days=30):
                    candidate = datetime(year + 1, m_num, day, default_hour, default_min)
                return candidate
            except ValueError:
                pass

    # 6. Days of the week: "Friday", "this Friday", "next Monday", "by Friday 5 PM"
    for day_name, day_idx in WEEKDAYS.items():
        pattern = rf"\b(next\s+|this\s+|by\s+|before\s+)?{day_name}\b"
        match_day = re.search(pattern, clean)
        if match_day:
            is_next = "next" in clean
            current_weekday = base_time.weekday()
            days_ahead = day_idx - current_weekday

            if days_ahead <= 0:  # Target day already occurred this week or is today
                days_ahead += 7

            if is_next and days_ahead < 7:
                days_ahead += 7

            target_date = base_time.date() + timedelta(days=days_ahead)
            return datetime(target_date.year, target_date.month, target_date.day, default_hour, default_min)

    # 7. Standard numerical date formats: MM/DD/YYYY or DD/MM/YYYY
    match_slashes = re.search(r"\b(\d{1,2})/(\d{1,2})/(\d{2,4})\b", clean)
    if match_slashes:
        p1, p2, yr = int(match_slashes.group(1)), int(match_slashes.group(2)), int(match_slashes.group(3))
        if yr < 100:
            yr += 2000
        # Try MM/DD/YYYY first
        try:
            return datetime(yr, p1, p2, default_hour, default_min)
        except ValueError:
            try:
                return datetime(yr, p2, p1, default_hour, default_min)
            except ValueError:
                pass

    return None
