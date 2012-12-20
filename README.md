LeoTamer
=========

Install
========

```
$ git clone
$ bundle install
```

Config
=======

config.yml

```yaml
:managers:
  - "localhost:10020" # master
  - "localhost:10021" # slave
:credential:
  :access_key_id: "YOUR_ACCESS_KEY_ID"
  :secret_access_key: "YOUR_SECRET_ACCESS_KEY"
```

Run on WEBrick
==============

```
$ ruby config.ru ${PORT}
```

ICONS
=========

[Database](http://barrymieny.deviantart.com/art/Database-104013446): Barry Mieny (CC BY-NC-SA 3.0)
[Tango Icon Library](http://tango.freedesktop.org/Tango_Icon_Library): Tango project (Public Domain)
[RRZE Icon Set](http://rrze-icon-set.berlios.de/): PRZE (CC BY-SA 3.0)
