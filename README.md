
# Jizura Sources DB


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Jizura Sources DB](#jizura-sources-db)
  - [Notes](#notes)
    - [Date Flow References](#date-flow-references)
  - [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Jizura Sources DB


## Notes

### Date Flow References

* Each relation has, as its primary key, a RowID column `rowid`.
  * RowIDs are strings that are formed like URNs and is sort-of human readable; for example, the RowID
    `t:mr:3pl:R=12345` means that
    * the row is in a `t`able (not a view);
    * it belongs to group `mr` (for 'mirror', which contains data that mirrors and pre-processes data from
      the source files);
    * within group `mr`, `3pl` uniquely identifies the table as `jzr_mirror_triples`;
    * within table `mr:3pl`, each `R`ow is again uniquely identified by its consecutive row number.
    * Some relations may also use `V=...` as last part where `V` stands for 'value'; for example, the
      allowed line codes (`lcode`s) are `B`, `C`, and `D`, which are stored in rows identified by
      `t:lc:V=B`, `t:lc:V=C`, and `t:lc:V=D`.
  * The value of the RowID uniquely identifies each row across the database.
* Each relation also has one (in the future also pssibly more) Reference column `ref`.
  * The Reference value(s) of a row identifie(s) the origin(s) of the data stored in that row;
  * if the data originated in another relation, then that relation's RowIDs are used;
  * if the data originated in a data source file, a similar reference is formed from the data source's
    `dskey` with a `:L=` and a line nr appended;
  * if the data originated from a non-digital or non-textual medium such as a book or an image, other ways
    to locate that data (e.g. page or pixel-based coordinates) may in the future be used.



## To Do

* in `meanings.txt` L19217: separate chrs 廓 and 度, which have nothing in common except for their KXR:

  ```tsv
  @glyphs 廓度
  u-cjk/5ed3  廓 py:kuò
  u-cjk/5ea6  度 py:dù, duó, duò
  u-cjk/5ed3  廓 ka:カク
  u-cjk/5ea6  度 ka:ド, ト, タク
  u-cjk/5ed3  廓 hi:くるわ, とりで
  u-cjk/5ea6  度 hi:たび, た·い
  u-cjk/5ed3  廓 hg:확, 곽
  u-cjk/5ea6  度 hg:도, 탁
  u-cjk/5ed3  廓 gloss:broad, wide, open, empty; to expand
  u-cjk/5ea6  度 gloss:degree, system; manner; to consider
  ```

* verify characters getting selected by `/\p{Script=Han}/v`, esp. punctuation, CJK x-F and higher,
  compatibility codepoints &c.

* does BVFS / `narumatt/sqlitefs` use `journal_mode = WAL`?

* use URNs / URLs / URIs / IRIs / [XRIs](https://en.wikipedia.org/wiki/Extensible_Resource_Identifier) /
  [PURLs](https://en.wikipedia.org/wiki/Persistent_uniform_resource_locator) to identify provenance of data
  * examples that show percent escapes:
    * https://example.com/jzr:foo:bar (ok)
    * https://example.com/foo:bar%C2%B4 (ends in U+00b4 Acute Accent `´`)
    * https://example.com/foo:bar' (ok)

* performance
* Dbric:
  * use of `new Dbric()` v `Dbric.open()`, why?
  * document, fix order of initialization steps:
    * functions
    * build statements
    * statement preparation
    * table population
  * related: how to decide when to rebuild? `Dbric::is_ready` v `Dbric::is_fresh`

* check for leading, trailing whitespace in field values
