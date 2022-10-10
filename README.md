# DowngradedDiscord

This is a simple patched version of Discord, there really isn't a lot to it.

---

# Installation & development

Install all dev dependencies via `npm install` then inject into your Discord client

### Stable
```ps
npm run inject
```
### PTB
```ps
npm run inject -- -ptb
```
### Canary
```ps
npm run inject -- -canary
```

## Writing patches

Patches are easy to write, you can first unpack Discord, take the file you wish to patch then modify it and put it in the `patches` directory

### Unpacking

### Stable
```ps
npm run unpack
```
### PTB
```ps
npm run unpack -- -ptb
```
### Canary
```ps
npm run unpack -- -canary
```

---

# Todo

* Plugins (there's a wip implementation, but it's far from complete)
* Don't expose require