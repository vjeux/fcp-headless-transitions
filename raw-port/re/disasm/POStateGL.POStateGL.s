__ZN9POStateGLC2Ev:
0000000000346060	pushq	%rbp
0000000000346061	movq	%rsp, %rbp
0000000000346064	pushq	%rbx
0000000000346065	pushq	%rax
0000000000346066	movq	%rdi, %rbx
0000000000346069	leaq	__ZTV9POStateGL(%rip), %rax     ## vtable for POStateGL
0000000000346070	addq	$0x10, %rax
0000000000346074	movq	%rax, (%rdi)
0000000000346077	leaq	0x8(%rdi), %rsi
000000000034607b	movl	$0xba7, %edi                    ## imm = 0xBA7
0000000000346080	callq	0x6dfef4                        ## symbol stub for: _glGetFloatv
0000000000346085	leaq	0x48(%rbx), %rsi
0000000000346089	movl	$0xba6, %edi                    ## imm = 0xBA6
000000000034608e	callq	0x6dfef4                        ## symbol stub for: _glGetFloatv
0000000000346093	leaq	0x88(%rbx), %rsi
000000000034609a	movl	$0xb71, %edi                    ## imm = 0xB71
000000000034609f	callq	0x6dfee8                        ## symbol stub for: _glGetBooleanv
00000000003460a4	movl	$0xbe2, %edi                    ## imm = 0xBE2
00000000003460a9	callq	0x6dff00                        ## symbol stub for: _glIsEnabled
00000000003460ae	movb	%al, 0x8a(%rbx)
00000000003460b4	movl	$0xbd0, %edi                    ## imm = 0xBD0
00000000003460b9	callq	0x6dff00                        ## symbol stub for: _glIsEnabled
00000000003460be	movb	%al, 0x8b(%rbx)
00000000003460c4	movl	$0xba1, %edi                    ## imm = 0xBA1
00000000003460c9	callq	0x6dff00                        ## symbol stub for: _glIsEnabled
00000000003460ce	movb	%al, 0x8c(%rbx)
00000000003460d4	leaq	0x89(%rbx), %rsi
00000000003460db	movl	$0xb72, %edi                    ## imm = 0xB72
00000000003460e0	callq	0x6dfee8                        ## symbol stub for: _glGetBooleanv
00000000003460e5	leaq	0x90(%rbx), %rsi
00000000003460ec	movl	$0xb21, %edi                    ## imm = 0xB21
00000000003460f1	callq	0x6dfefa                        ## symbol stub for: _glGetIntegerv
00000000003460f6	leaq	0x94(%rbx), %rsi
00000000003460fd	movl	$0xb50, %edi                    ## imm = 0xB50
0000000000346102	callq	0x6dfee8                        ## symbol stub for: _glGetBooleanv
0000000000346107	leaq	0x95(%rbx), %rsi
000000000034610e	movl	$0xb20, %edi                    ## imm = 0xB20
0000000000346113	callq	0x6dfee8                        ## symbol stub for: _glGetBooleanv
0000000000346118	leaq	0x98(%rbx), %rsi
000000000034611f	movl	$0x80c9, %edi                   ## imm = 0x80C9
0000000000346124	callq	0x6dfefa                        ## symbol stub for: _glGetIntegerv
0000000000346129	leaq	0x9c(%rbx), %rsi
0000000000346130	movl	$0x80cb, %edi                   ## imm = 0x80CB
0000000000346135	callq	0x6dfefa                        ## symbol stub for: _glGetIntegerv
000000000034613a	leaq	0xa0(%rbx), %rsi
0000000000346141	movl	$0x80c8, %edi                   ## imm = 0x80C8
0000000000346146	callq	0x6dfefa                        ## symbol stub for: _glGetIntegerv
000000000034614b	leaq	0xa4(%rbx), %rsi
0000000000346152	movl	$0x80ca, %edi                   ## imm = 0x80CA
0000000000346157	callq	0x6dfefa                        ## symbol stub for: _glGetIntegerv
000000000034615c	leaq	0xa8(%rbx), %rsi
0000000000346163	movl	$0xd57, %edi                    ## imm = 0xD57
0000000000346168	callq	0x6dfefa                        ## symbol stub for: _glGetIntegerv
000000000034616d	addq	$0xac, %rbx
0000000000346174	movl	$0xba0, %edi                    ## imm = 0xBA0
0000000000346179	movq	%rbx, %rsi
000000000034617c	addq	$0x8, %rsp
0000000000346180	popq	%rbx
0000000000346181	popq	%rbp
0000000000346182	jmp	0x6dfefa                        ## symbol stub for: _glGetIntegerv
0000000000346187	nopw	(%rax,%rax)
