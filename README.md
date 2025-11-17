
# Jizura Sources DB


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Jizura Sources DB](#jizura-sources-db)
  - [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Jizura Sources DB








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


