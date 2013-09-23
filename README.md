LeoCenter
==========

**Copyright (c) 2013 Rakuten, Inc.**

**LeoCenter** is more powerful and user-friendly LeoFS's Web GUI Tool. You can easily operate LeoFS.


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

Run on Thin Web Server
======================

```
$ ruby config_webrick.ru ${PORT}
```

Run on Unicorn
==============

```
$ unicorn -c unicorn.conf config_unicorn.ru
```

Icons
=====

* [Database](http://barrymieny.deviantart.com/art/Database-104013446): Barry Mieny (CC BY-NC-SA 3.0)
* [Tango Icon Library](http://tango.freedesktop.org/Tango_Icon_Library): Tango project (Public Domain)
* [RRZE Icon Set](http://rrze-icon-set.berlios.de/): PRZE (CC BY-SA 3.0)
* [Fire Icon, Database, Refresh Icon](http://www.fatcow.com/): FatCow Web Hosting (CC BY 3.0 US)
