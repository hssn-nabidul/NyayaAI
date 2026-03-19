# DATABASE.md — Nyaya: Drift Database Schema

---

## Overview

All data is stored **on-device** using Drift (type-safe SQLite wrapper for Flutter).
No cloud database. No sync. Fully offline.

Database file location: Android internal storage (`/data/data/com.nyaya.app/databases/nyaya.db`)

---

## Tables

### 1. `cases` — Downloaded judgments

```dart
class Cases extends Table {
  // Primary key
  TextColumn get docId => text()();           // Indian Kanoon docId (e.g., "1234567")

  // Metadata
  TextColumn get title => text()();           // "Justice K.S. Puttaswamy v. Union of India"
  TextColumn get court => text()();           // "Supreme Court of India" | "Delhi High Court" etc.
  TextColumn get courtCode => text()();       // "SC" | "DHC" | "BHC" etc. (for filtering)
  TextColumn get date => text()();            // "2017-08-24" (ISO format)
  TextColumn get year => integer()();         // 2017 (for sorting/filtering)
  TextColumn get citation => text().nullable()(); // "AIR 2017 SC 4161"
  TextColumn get judges => text()();          // JSON: ["D.Y. Chandrachud", "R.F. Nariman", ...]
  TextColumn get parties => text()();         // JSON: {"petitioner": "...", "respondent": "..."}
  TextColumn get areaOfLaw => text()();       // JSON: ["Constitutional", "Fundamental Rights"]
  TextColumn get bench => text().nullable()(); // "9-Judge Constitution Bench"

  // Content
  TextColumn get fullText => text()();        // Full judgment text (sanitised, no HTML)
  IntColumn get wordCount => integer()();     // Approximate word count

  // App metadata
  BoolColumn get isBookmarked => boolean().withDefault(const Constant(false))();
  BoolColumn get hasBeenRead => boolean().withDefault(const Constant(false))();
  DateTimeColumn get savedAt => dateTime()();
  DateTimeColumn get lastOpenedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {docId};
}
```

**Indexes:**
```dart
@TableIndex(name: 'idx_cases_court', columns: {#courtCode})
@TableIndex(name: 'idx_cases_year', columns: {#year})
@TableIndex(name: 'idx_cases_saved', columns: {#savedAt})
@TableIndex(name: 'idx_cases_bookmark', columns: {#isBookmarked})
```

---

### 2. `summaries` — AI-generated summaries

```dart
class Summaries extends Table {
  TextColumn get docId => text()();             // FK → cases.docId

  // AI-generated content
  TextColumn get plainSummary => text()();      // 3-4 sentence plain English summary
  TextColumn get keyIssues => text()();         // JSON: ["Issue 1", "Issue 2", ...]
  TextColumn get holding => text()();           // Court's decision in plain English
  TextColumn get precedentsCited => text()();   // JSON: [{"title": "...", "docId": "..."}, ...]
  TextColumn get areasOfLaw => text()();        // JSON: ["Constitutional", "Art.21", "Privacy"]
  TextColumn get significance => text()();      // 1-2 sentences on why this case matters

  // Metadata
  TextColumn get modelUsed => text()();         // "gemini-1.5-flash"
  DateTimeColumn get generatedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {docId};
}
```

---

### 3. `annotations` — Highlights and notes

```dart
class Annotations extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get docId => text()();             // FK → cases.docId

  // Highlight data
  IntColumn get startOffset => integer()();     // Character offset in fullText
  IntColumn get endOffset => integer()();       // Character offset in fullText
  TextColumn get highlightedText => text()();   // The actual text that was highlighted
  TextColumn get colour => text()();            // "yellow" | "blue" | "green"

  // Note (optional)
  TextColumn get note => text().nullable()();   // User's personal note on this highlight
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
}
```

**Index:**
```dart
@TableIndex(name: 'idx_annotations_doc', columns: {#docId})
```

---

### 4. `citation_graphs` — Cached citation data

```dart
class CitationGraphs extends Table {
  TextColumn get docId => text()();             // Case this graph belongs to

  // Graph data
  TextColumn get cites => text()();             // JSON: [{docId, title, court, year}, ...]
  TextColumn get citedBy => text()();           // JSON: [{docId, title, court, year}, ...]
  TextColumn get overruled => text()();         // JSON: [{docId, title}, ...] (cases overruled by this)
  IntColumn get totalCitations => integer()();  // Total times this case has been cited

  DateTimeColumn get fetchedAt => dateTime()();  // For cache invalidation (7 days TTL)

  @override
  Set<Column> get primaryKey => {docId};
}
```

---

### 5. `judge_profiles` — Cached judge analytics

```dart
class JudgeProfiles extends Table {
  TextColumn get name => text()();              // "D.Y. Chandrachud" (primary key)
  TextColumn get currentCourt => text()();      // "Supreme Court of India"
  TextColumn get currentRole => text()();       // "Chief Justice of India"
  TextColumn get appointedDate => text().nullable()();

  // Analytics
  IntColumn get totalJudgments => integer()();
  TextColumn get subjectBreakdown => text()();  // JSON: {"Constitutional": 45, "Criminal": 20, ...}
  TextColumn get notableJudgments => text()();  // JSON: [{docId, title, year, significance}, ...]
  TextColumn get ideologicalTendency => text()(); // "Rights-expansive" | "Textualist" etc.
  IntColumn get pilAdmissionRate => integer().nullable()(); // Percentage (0-100)

  // AI-generated description
  TextColumn get profileSummary => text()();    // 2-3 sentence Gemini-generated profile

  DateTimeColumn get generatedAt => dateTime()(); // For cache (30 days TTL)

  @override
  Set<Column> get primaryKey => {name};
}
```

---

### 6. `search_history` — Recent searches

```dart
class SearchHistory extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get query => text()();             // The search string
  TextColumn get type => text()();              // "keyword" | "nlp" | "citation"
  IntColumn get resultCount => integer()();     // How many results came back
  DateTimeColumn get searchedAt => dateTime()();
}
// Cap: keep last 50 entries. On insert when count >= 50, delete oldest.
```

---

### 7. `moot_sessions` — Saved moot prep

```dart
class MootSessions extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get proposition => text()();       // The moot proposition text
  TextColumn get side => text()();              // "petitioner" | "respondent" | "both"
  TextColumn get result => text()();            // Full JSON result from Gemini
  DateTimeColumn get createdAt => dateTime()();
}
```

---

### 8. `ask_ai_conversations` — Chat history per case

```dart
class AskAiConversations extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get docId => text()();             // FK → cases.docId
  TextColumn get role => text()();              // "user" | "assistant"
  TextColumn get content => text()();           // Message content
  DateTimeColumn get timestamp => dateTime()();
}
```

**Index:**
```dart
@TableIndex(name: 'idx_chat_doc', columns: {#docId})
```

---

## DAOs

### CasesDao

```dart
@DriftAccessor(tables: [Cases])
class CasesDao extends DatabaseAccessor<AppDatabase> with _$CasesDaoMixin {

  // Save or update a case (use on download)
  Future<void> upsertCase(CasesCompanion entry) =>
    into(cases).insertOnConflictUpdate(entry);

  // Get a single case by docId (returns null if not downloaded)
  Future<Case?> getCaseById(String docId) =>
    (select(cases)..where((t) => t.docId.equals(docId))).getSingleOrNull();

  // Get all saved cases, newest first
  Stream<List<Case>> watchAllCases() =>
    (select(cases)..orderBy([(t) => OrderingTerm.desc(t.savedAt)])).watch();

  // Get bookmarked cases only
  Stream<List<Case>> watchBookmarked() =>
    (select(cases)..where((t) => t.isBookmarked.equals(true))).watch();

  // Filter by court
  Stream<List<Case>> watchByCourt(String courtCode) =>
    (select(cases)
      ..where((t) => t.courtCode.equals(courtCode))
      ..orderBy([(t) => OrderingTerm.desc(t.savedAt)])).watch();

  // Toggle bookmark
  Future<void> toggleBookmark(String docId, bool value) =>
    (update(cases)..where((t) => t.docId.equals(docId)))
      .write(CasesCompanion(isBookmarked: Value(value)));

  // Mark as read
  Future<void> markAsRead(String docId) =>
    (update(cases)..where((t) => t.docId.equals(docId)))
      .write(CasesCompanion(
        hasBeenRead: const Value(true),
        lastOpenedAt: Value(DateTime.now()),
      ));

  // Get total storage used (sum of fullText lengths in bytes)
  Future<int> getTotalStorageBytes() async {
    final result = await (selectOnly(cases)
      ..addColumns([cases.fullText.length]))
      .get();
    return result.fold(0, (sum, row) => sum + (row.read(cases.fullText.length) ?? 0));
  }

  // Delete a case (also cascades to summaries, annotations, chat via FK or manual delete)
  Future<void> deleteCase(String docId) =>
    (delete(cases)..where((t) => t.docId.equals(docId))).go();
}
```

### SummariesDao

```dart
@DriftAccessor(tables: [Summaries])
class SummariesDao extends DatabaseAccessor<AppDatabase> with _$SummariesDaoMixin {

  Future<void> upsertSummary(SummariesCompanion entry) =>
    into(summaries).insertOnConflictUpdate(entry);

  Future<Summary?> getSummaryForCase(String docId) =>
    (select(summaries)..where((t) => t.docId.equals(docId))).getSingleOrNull();

  // Check if summary exists before making API call
  Future<bool> hasSummary(String docId) async {
    final count = await (selectOnly(summaries)
      ..where(summaries.docId.equals(docId))
      ..addColumns([summaries.docId.count()])).getSingle();
    return (count.read(summaries.docId.count()) ?? 0) > 0;
  }

  Future<void> deleteSummaryForCase(String docId) =>
    (delete(summaries)..where((t) => t.docId.equals(docId))).go();
}
```

### AnnotationsDao

```dart
@DriftAccessor(tables: [Annotations])
class AnnotationsDao extends DatabaseAccessor<AppDatabase> with _$AnnotationsDaoMixin {

  // Get all annotations for a case, ordered by position
  Stream<List<Annotation>> watchAnnotationsForCase(String docId) =>
    (select(annotations)
      ..where((t) => t.docId.equals(docId))
      ..orderBy([(t) => OrderingTerm.asc(t.startOffset)])).watch();

  Future<int> insertAnnotation(AnnotationsCompanion entry) =>
    into(annotations).insert(entry);

  Future<void> updateNote(int id, String note) =>
    (update(annotations)..where((t) => t.id.equals(id)))
      .write(AnnotationsCompanion(
        note: Value(note),
        updatedAt: Value(DateTime.now()),
      ));

  Future<void> deleteAnnotation(int id) =>
    (delete(annotations)..where((t) => t.id.equals(id))).go();

  Future<void> deleteAllForCase(String docId) =>
    (delete(annotations)..where((t) => t.docId.equals(docId))).go();
}
```

### SearchHistoryDao

```dart
@DriftAccessor(tables: [SearchHistory])
class SearchHistoryDao extends DatabaseAccessor<AppDatabase> with _$SearchHistoryDaoMixin {

  static const int _maxEntries = 50;

  Future<void> addSearch(String query, String type, int resultCount) async {
    final count = await (selectOnly(searchHistory)
      ..addColumns([searchHistory.id.count()])).getSingle();
    final total = count.read(searchHistory.id.count()) ?? 0;

    if (total >= _maxEntries) {
      // Delete oldest entry
      final oldest = await (select(searchHistory)
        ..orderBy([(t) => OrderingTerm.asc(t.searchedAt)])
        ..limit(1)).getSingleOrNull();
      if (oldest != null) {
        await (delete(searchHistory)..where((t) => t.id.equals(oldest.id))).go();
      }
    }

    await into(searchHistory).insert(SearchHistoryCompanion.insert(
      query: query,
      type: type,
      resultCount: resultCount,
      searchedAt: DateTime.now(),
    ));
  }

  Stream<List<SearchHistoryData>> watchRecent() =>
    (select(searchHistory)
      ..orderBy([(t) => OrderingTerm.desc(t.searchedAt)])
      ..limit(20)).watch();

  Future<void> clearHistory() => delete(searchHistory).go();
}
```

---

## Database Class

```dart
@DriftDatabase(
  tables: [
    Cases,
    Summaries,
    Annotations,
    CitationGraphs,
    JudgeProfiles,
    SearchHistory,
    MootSessions,
    AskAiConversations,
  ],
  daos: [
    CasesDao,
    SummariesDao,
    AnnotationsDao,
    SearchHistoryDao,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
    },
    onUpgrade: (Migrator m, int from, int to) async {
      // Handle migrations here when schemaVersion increases
    },
  );
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'nyaya.db'));
    return NativeDatabase.createInBackground(file);
  });
}
```

---

*Document: DATABASE.md · Project: Nyaya · Version: 1.0*
