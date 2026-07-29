__ZN16XMLtoFactoryBaseD0Ev:
000000000033d100	pushq	%rbp
000000000033d101	movq	%rsp, %rbp
000000000033d104	pushq	%r14
000000000033d106	pushq	%rbx
000000000033d107	movq	%rdi, %rbx
000000000033d10a	leaq	0x513447(%rip), %rax
000000000033d111	movq	%rax, (%rdi)
000000000033d114	movq	0x10(%rdi), %rdi
000000000033d118	testq	%rdi, %rdi
000000000033d11b	je	0x33d12b
000000000033d11d	movq	(%rdi), %rax
000000000033d120	callq	*0x8(%rax)
000000000033d123	movq	$0x0, 0x10(%rbx)
000000000033d12b	leaq	_theApp(%rip), %r14
000000000033d132	movq	(%r14), %rax
000000000033d135	movq	0x20(%rax), %rdi
000000000033d139	callq	0x6dd5d2                        ## symbol stub for: __ZN11OZFactories19clearFactoryLoadIDsEv
000000000033d13e	movq	(%r14), %rax
000000000033d141	movq	0x28(%rax), %rcx
000000000033d145	movq	%rcx, 0x30(%rax)
000000000033d149	movq	%rbx, %rdi
000000000033d14c	popq	%rbx
000000000033d14d	popq	%r14
000000000033d14f	popq	%rbp
000000000033d150	jmp	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000033d155	movq	%rax, %rdi
000000000033d158	callq	___clang_call_terminate
000000000033d15d	nopl	(%rax)
