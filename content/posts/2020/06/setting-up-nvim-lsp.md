+++
title = "Setting up nvim-lsp"
date = "2020-06-12"
categories = ["Neovim", "Setup"]
+++

Just a quick one, as I've found `nvim-lsp`'s documentation to be a bit lacking.
I hope this will get you up and running with this great tool:

`nvim-lsp` is Neovim's fully integrated language server protocol implementation
that allows syntax checking, linting and `omnifunc` code completion within the
editor. Currently, it is available as part of Neovim's `master` branch, so in
many cases (unless you are running Ubuntu, in which case there is a nice snap
package available for you, so you can simply install the latest development
release with `snap install --classic --edge neovim`), you will have to compile
Neovim from source to start using it.

Without any language server configurations, the lsp client is useless.
Configurations are distributed separate from the editor itself; using a plugin
manager like `vim-plug` or `dein`, you can install these configurations just
like any other plugin:

```vim
" In your .config/nvim/init.vim (Unix):
Plug 'neovim/nvim-lsp'
```

Each of these configurations targets a different LSP server. You must activate
those that you wish to use individually. For example, if I want to have rust
completion using `rust-analyzer`, I must add the following to the bottom of
`$MYVIMRC`:

```vim
" Enable rust-analyzer
lua require'nvim_lsp'.rust_analyzer.setup{}
```

*Note:* ensure the LSP is installed and available on your `PATH` environment
variable first, otherwise you will get an error message claiming that the LSP is
not executable when you attempt to open an associated file type in your editor.

*Note:* see that `lua` keyword? `nvim-lsp` is entirely written in Lua, so make
sure you know how to embed lua code in your Neovim configuration.

*See also:* some LSPs have configuration options which you may want to toggle to
work with your environment. Have a look at `nvim-lsp`'s
[README](https://github.com/neovim/nvim-lsp/blob/master/README.md#Configurations)
for further information concerning your specific LSP configuration.

Now, syntax highlighting and diagnostics facilities now begin immediately when
you open the editor again on a new source file associated with the enabled LSP
configurations, but you can't navigate code using the LSP's features and verbs
or use code completion just yet.

You can configure navigation mappings yourself in `$MYVIMRC`:

```vim
nnoremap <silent> gd    <cmd>lua vim.lsp.buf.declaration()<CR>
nnoremap <silent> <c-]> <cmd>lua vim.lsp.buf.definition()<CR>
nnoremap <silent> K     <cmd>lua vim.lsp.buf.hover()<CR>
nnoremap <silent> gD    <cmd>lua vim.lsp.buf.implementation()<CR>
nnoremap <silent> <c-k> <cmd>lua vim.lsp.buf.signature_help()<CR>
nnoremap <silent> 1gD   <cmd>lua vim.lsp.buf.type_definition()<CR>
nnoremap <silent> gr    <cmd>lua vim.lsp.buf.references()<CR>
nnoremap <silent> g0    <cmd>lua vim.lsp.buf.document_symbol()<CR>
nnoremap <silent> gW    <cmd>lua vim.lsp.buf.workspace_symbol()<CR>
```

And, finally, to enable omnifunc completion in insert mode (i.e. `<C-X><C-O>`):

```vim
" Enable nvim-lsp as the default omnifunc globally:
set omnifunc=v:lua.vim.lsp.omnifunc
" Or only for a specific filetype:
autocmd Filetype rust setlocal omnifunc=v:lua.vim.lsp.omnifunc
```

Pretty much all of `nvim-lsp` should now be accessible to you from when you
source your `.vimrc`. Give it a go!

But what if you want insert-mode completion using `<Tab>`? You'll need another
plugin that can do that for you, such as `deoplete.nvim`:

```vim
" Insert-mode completion
Plug 'Shougo/deoplete.nvim'

let g:deoplete#enable_at_startup = 1

" And a plugin connecting deoplete to nvim-lsp
Plug "Shougo/deoplete-lsp"
```

Once installed, you should be able to just tab away to get your automatic code
completion. Smashing.
