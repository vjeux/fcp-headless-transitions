__ZN12HGColorGamma6GetROIEP10HGRendereri6HGRect:
00000000000f5fd0	pushq	%rbp
00000000000f5fd1	movq	%rsp, %rbp
00000000000f5fd4	testl	%edx, %edx
00000000000f5fd6	jne	0xf5fe5
00000000000f5fd8	movq	%rcx, %rax
00000000000f5fdb	cmpq	$0x0, 0x1a0(%rdi)
00000000000f5fe3	je	0xf5ff3
00000000000f5fe5	leaq	_HGRectNull(%rip), %rcx
00000000000f5fec	movq	(%rcx), %rax
00000000000f5fef	movq	0x8(%rcx), %r8
00000000000f5ff3	movq	%r8, %rdx
00000000000f5ff6	popq	%rbp
00000000000f5ff7	retq
00000000000f5ff8	nopl	(%rax,%rax)
