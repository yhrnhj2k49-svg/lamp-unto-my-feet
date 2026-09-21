// Watch & Listen: a fixed, hand-checked library.
//
// Every video id below was confirmed through YouTube's oEmbed endpoint to
// exist, to allow embedding, and to belong to the official channel of the
// ministry that made it — Jesus Film Project (@jesusfilm) or BibleProject
// (@bibleproject). Both put their work out to be shared freely. Uploads of the
// same films by other channels were found and left out.
//
// Commercially distributed films (The Chosen, The Passion of the Christ, and
// the like) are not here: they are not ours to show.
//
// No thumbnails. They would load from Google's image servers the moment this
// screen opened, before anyone chose to watch anything.

export type Video = {
  id: string;
  title: string;
  from: "Jesus Film Project" | "BibleProject";
  minutes: number;
  about: string;
};

export type VideoGroup = { title: string; note: string; videos: Video[] };

export const VIDEO_GROUPS: VideoGroup[] = [
  {
    title: "Films",
    note: "Full-length, from the Jesus Film Project, which makes them to be shared freely.",
    videos: [
      {
        id: "o-o2JHhHXys",
        title: "JESUS",
        from: "Jesus Film Project",
        minutes: 128,
        about: "The 1979 film of the life of Jesus, drawn from the Gospel of Luke.",
      },
      {
        id: "TGwlXdNewnM",
        title: "The Life of Jesus",
        from: "Jesus Film Project",
        minutes: 183,
        about: "The Gospel of John, dramatized as a feature film.",
      },
      {
        id: "NnWpN-chIAw",
        title: "The Easter Story",
        from: "Jesus Film Project",
        minutes: 44,
        about: "From the Last Supper to the resurrection.",
      },
      {
        id: "H6u9eRxMbeE",
        title: "The Story of Jesus for Children",
        from: "Jesus Film Project",
        minutes: 62,
        about: "The life of Jesus, told for children.",
      },
    ],
  },
  {
    title: "For a hard season",
    note: "Short animated studies from BibleProject.",
    videos: [
      {
        id: "4WYNBjJSYvE",
        title: "Hope",
        from: "BibleProject",
        minutes: 5,
        about: "A study of the Hebrew word for hope.",
      },
      {
        id: "oLYORLZOaZE",
        title: "Shalom — Peace",
        from: "BibleProject",
        minutes: 4,
        about: "What the Bible means by peace.",
      },
      {
        id: "slyevQ1LW7A",
        title: "Agape — Love",
        from: "BibleProject",
        minutes: 5,
        about: "A study of the Greek word for love.",
      },
      {
        id: "6KQLOuIKaRA",
        title: "Shema — Listen",
        from: "BibleProject",
        minutes: 3,
        about: "A study of the Hebrew word for listen.",
      },
      {
        id: "b54d_GhBthI",
        title: "Struggles in Life",
        from: "BibleProject",
        minutes: 6,
        about: "How the Bible talks about the hard things we go through.",
      },
      {
        id: "HCLuq_5o7_o",
        title: "Trusting God When It Seems Risky",
        from: "BibleProject",
        minutes: 5,
        about: "Why trust in God is worth the risk.",
      },
    ],
  },
  {
    title: "Books of the Bible",
    note: "Animated overviews from BibleProject, a book at a time.",
    videos: [
      { id: "xQwnH8th_fs", title: "Job", from: "BibleProject", minutes: 11, about: "Suffering, and how God runs the world." },
      { id: "j9phNEaPrv8", title: "Psalms", from: "BibleProject", minutes: 9, about: "The prayer book of the Bible." },
      { id: "p8GDFPdaQZQ", title: "Lamentations", from: "BibleProject", minutes: 7, about: "Grief, put into poetry." },
      { id: "lrsQ1tc-2wk", title: "Ecclesiastes", from: "BibleProject", minutes: 8, about: "What any of it is for." },
      { id: "oE9qqW1-BkU", title: "Philippians", from: "BibleProject", minutes: 9, about: "Joy, written from prison." },
    ],
  },
];

export type Show = { id: string; title: string; by: string; about: string };

// The server keeps the matching feed URLs and refuses any id not listed there.
// Catholic, Protestant and non-denominational voices, on purpose.
export const SHOWS: Show[] = [
  {
    id: "pray-as-you-go",
    title: "Pray As You Go",
    by: "Jesuit Media Initiatives",
    about: "A daily guided prayer with music and scripture, around ten to fifteen minutes.",
  },
  {
    id: "bible-in-a-year",
    title: "The Bible in a Year",
    by: "Fr. Mike Schmitz · Ascension",
    about: "The whole Bible read aloud across a year, with a reflection each day.",
  },
  {
    id: "bible-recap",
    title: "The Bible Recap",
    by: "Tara-Leigh Cobble",
    about: "A short daily recap to go alongside a chronological reading plan.",
  },
  {
    id: "daily-audio-bible",
    title: "Daily Audio Bible",
    by: "Daily Audio Bible",
    about: "Scripture read aloud every day through the year, with prayer.",
  },
  {
    id: "bibleproject",
    title: "BibleProject",
    by: "Tim Mackie & Jon Collins",
    about: "Long conversations on the story and themes of the Bible.",
  },
  {
    id: "tim-keller",
    title: "Timothy Keller Sermons",
    by: "Gospel in Life",
    about: "Sermons from the late Timothy Keller of Redeemer Presbyterian, New York.",
  },
];

export const minutesLabel = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`);
