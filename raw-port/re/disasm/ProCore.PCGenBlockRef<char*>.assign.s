__ZN13PCGenBlockRefIPcE6assignEPS0_:
00000000000ba044	pushq	%rbp
00000000000ba045	movq	%rsp, %rbp
00000000000ba048	pushq	%r14
00000000000ba04a	pushq	%rbx
00000000000ba04b	movq	%rdi, %r14
00000000000ba04e	movq	(%rdi), %rdi
00000000000ba051	cmpq	%rdi, %rsi
00000000000ba054	je	0xba077
00000000000ba056	movq	%rsi, %rbx
00000000000ba059	testq	%rdi, %rdi
00000000000ba05c	je	0xba06c
00000000000ba05e	decl	-0x4(%rdi)
00000000000ba061	jne	0xba06c
00000000000ba063	addq	$-0x8, %rdi
00000000000ba067	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000ba06c	movq	%rbx, (%r14)
00000000000ba06f	testq	%rbx, %rbx
00000000000ba072	je	0xba077
00000000000ba074	incl	-0x4(%rbx)
00000000000ba077	popq	%rbx
00000000000ba078	popq	%r14
00000000000ba07a	popq	%rbp
00000000000ba07b	retq
