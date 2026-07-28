__ZN13OZCoreGlobalsC1Ev:
0000000000013c0e	pushq	%rbp
0000000000013c0f	movq	%rsp, %rbp
0000000000013c12	pushq	%rbx
0000000000013c13	pushq	%rax
0000000000013c14	movq	%rdi, %rbx
0000000000013c17	xorl	%esi, %esi
0000000000013c19	callq	0xacb46                         ## symbol stub for: __ZN11PCSingletonC2Ej
0000000000013c1e	leaq	__ZTV13OZCoreGlobals(%rip), %rax ## vtable for OZCoreGlobals
0000000000013c25	addq	$0x10, %rax
0000000000013c29	movq	%rax, (%rbx)
0000000000013c2c	movl	$0x1000000, 0x8(%rbx)           ## imm = 0x1000000
0000000000013c33	movq	0xb6886(%rip), %rax             ## literal pool symbol address: _kCMTimeZero
0000000000013c3a	movups	(%rax), %xmm0
0000000000013c3d	movups	%xmm0, 0xc(%rbx)
0000000000013c41	movq	0x10(%rax), %rax
0000000000013c45	movq	%rax, 0x1c(%rbx)
0000000000013c49	addq	$0x8, %rsp
0000000000013c4d	popq	%rbx
0000000000013c4e	popq	%rbp
0000000000013c4f	retq
