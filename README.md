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
