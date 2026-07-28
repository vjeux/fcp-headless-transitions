__ZN13LiImageSource15getSourceAtTimeE6CMTimebRK14OZRenderParams:
00000000000df060	pushq	%rbp
00000000000df061	movq	%rsp, %rbp
00000000000df064	pushq	%rbx
00000000000df065	pushq	%rax
00000000000df066	movq	%rdi, %rbx
00000000000df069	movq	%rsi, (%rdi)
00000000000df06c	testq	%rsi, %rsi
00000000000df06f	je	0xdf07a
00000000000df071	movq	(%rsi), %rax
00000000000df074	addq	-0x18(%rax), %rsi
00000000000df078	jmp	0xdf07c
00000000000df07a	xorl	%esi, %esi
00000000000df07c	movq	%rbx, %rdi
00000000000df07f	addq	$0x8, %rdi
00000000000df083	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000000df088	movq	%rbx, %rax
00000000000df08b	addq	$0x8, %rsp
00000000000df08f	popq	%rbx
00000000000df090	popq	%rbp
00000000000df091	retq
00000000000df092	nopw	%cs:(%rax,%rax)
