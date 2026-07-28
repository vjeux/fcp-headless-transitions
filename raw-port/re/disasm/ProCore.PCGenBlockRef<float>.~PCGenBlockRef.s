__ZN13PCGenBlockRefIfED2Ev:
00000000000b6c4a	pushq	%rbp
00000000000b6c4b	movq	%rsp, %rbp
00000000000b6c4e	pushq	%rbx
00000000000b6c4f	pushq	%rax
00000000000b6c50	movq	%rdi, %rbx
00000000000b6c53	movq	(%rdi), %rdi
00000000000b6c56	testq	%rdi, %rdi
00000000000b6c59	je	0xb6c70
00000000000b6c5b	decl	-0x4(%rdi)
00000000000b6c5e	jne	0xb6c70
00000000000b6c60	addq	$-0x8, %rdi
00000000000b6c64	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000b6c69	movq	$0x0, (%rbx)
00000000000b6c70	addq	$0x8, %rsp
00000000000b6c74	popq	%rbx
00000000000b6c75	popq	%rbp
00000000000b6c76	retq
00000000000b6c77	nop
