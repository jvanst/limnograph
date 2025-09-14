/**
  These operating bounds were referenced from https://www.klca.org/copy-of-mind-your-wake. The bounds
  use a conversion factor 346.085. The conversion factor is added to the WATEROFFICE number
  e.g., for July 1st, the WATEROFFICE number is 9.5. 346.08+ 9.5 = 355.585

  Note, these are the *upper thresholds* — that means 'high water' shares its lower bounds with upper operating higher bounds

  High water
  n/a

  Upper operating
  Jan 1st - 356.07
  Dec 31st - 356.07

  Normal operating
  Jan 1st - 355.3
  Feb 12 - 355.3
  Mar 12 - 355.0
  Apr 2 - 355.7
  July 2 - 355.7
  Sept 10 - 355.54
  Oct 15 - 354.94
  Dec 3 - 355.3
  Dec 31 - 355.3

  Lower Operating
  Jan 1st - 354.79
  Jan 15 - 354.79
  Feb 26 - 354.5
  Apr 2 - 354.5
  Apr 30 - 355.4
  Jul 2 - 355.35
  Sept 10 - 355.1
  Oct 12 - 354.7
  Dec 31 - 354.79

  Low water
  Jan 1 - 354.2
  Apr 1 - 354.2
  May 21 - 355.2
  Jun 4 - 355.2
  Aug 27 - 354.9
  Oct 15 - 354.3
  Dec 31 - 354.2
 */

export const upperOperating = {
  upper: [
    {
      day: 0,
      value: 9.985000000000014,
    },
    {
      day: 365,
      value: 9.985000000000014,
    },
  ],
  lower: [
    {
      day: 0,
      value: 9.215000000000032,
    },
    {
      day: 42,
      value: 9.215000000000032,
    },
    {
      day: 70,
      value: 8.91500000000002,
    },
    {
      day: 91,
      value: 9.615000000000009,
    },
    {
      day: 182,
      value: 9.615000000000009,
    },
    {
      day: 252,
      value: 9.455000000000041,
    },
    {
      day: 287,
      value: 8.855000000000018,
    },
    {
      day: 336,
      value: 9.215000000000032,
    },
    {
      day: 365,
      value: 9.215000000000032,
    },
  ],
};

export const normalOperating = {
  upper: [
    {
      day: 0,
      value: 9.215000000000032,
    },
    {
      day: 42,
      value: 9.215000000000032,
    },
    {
      day: 70,
      value: 8.91500000000002,
    },
    {
      day: 91,
      value: 9.615000000000009,
    },
    {
      day: 182,
      value: 9.615000000000009,
    },
    {
      day: 252,
      value: 9.455000000000041,
    },
    {
      day: 287,
      value: 8.855000000000018,
    },
    {
      day: 336,
      value: 9.215000000000032,
    },
    {
      day: 365,
      value: 9.215000000000032,
    },
  ],
  lower: [
    {
      day: 0,
      value: 8.705000000000041,
    },
    {
      day: 14,
      value: 8.705000000000041,
    },
    {
      day: 56,
      value: 8.41500000000002,
    },
    {
      day: 91,
      value: 8.41500000000002,
    },
    {
      day: 119,
      value: 9.314999999999998,
    },
    {
      day: 182,
      value: 9.265000000000043,
    },
    {
      day: 252,
      value: 9.015000000000043,
    },
    {
      day: 284,
      value: 8.615000000000009,
    },
    {
      day: 365,
      value: 8.705000000000041,
    },
  ],
};

export const lowerOperating = {
  upper: [
    {
      day: 0,
      value: 8.705000000000041,
    },
    {
      day: 14,
      value: 8.705000000000041,
    },
    {
      day: 56,
      value: 8.41500000000002,
    },
    {
      day: 91,
      value: 8.41500000000002,
    },
    {
      day: 119,
      value: 9.314999999999998,
    },
    {
      day: 182,
      value: 9.265000000000043,
    },
    {
      day: 252,
      value: 9.015000000000043,
    },
    {
      day: 284,
      value: 8.615000000000009,
    },
    {
      day: 365,
      value: 8.705000000000041,
    },
  ],
  lower: [
    {
      day: 0,
      value: 8.115000000000009,
    },
    {
      day: 90,
      value: 8.115000000000009,
    },
    {
      day: 140,
      value: 9.115000000000009,
    },
    {
      day: 154,
      value: 9.115000000000009,
    },
    {
      day: 238,
      value: 8.814999999999998,
    },
    {
      day: 287,
      value: 8.215000000000032,
    },
    {
      day: 365,
      value: 8.115000000000009,
    },
  ],
};
