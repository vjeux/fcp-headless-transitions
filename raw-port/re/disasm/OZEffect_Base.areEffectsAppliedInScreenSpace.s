__ZN13OZEffect_Base30areEffectsAppliedInScreenSpaceEv:
00000000000f8950	pushq	%rbp
00000000000f8951	movq	%rsp, %rbp
00000000000f8954	movq	0x18(%rdi), %rdi
00000000000f8958	testq	%rdi, %rdi
00000000000f895b	je	0xf8967
00000000000f895d	movq	(%rdi), %rax
00000000000f8960	popq	%rbp
00000000000f8961	jmpq	*0x90(%rax)
00000000000f8967	xorl	%eax, %eax
00000000000f8969	popq	%rbp
00000000000f896a	retq
00000000000f896b	nopl	(%rax,%rax)
