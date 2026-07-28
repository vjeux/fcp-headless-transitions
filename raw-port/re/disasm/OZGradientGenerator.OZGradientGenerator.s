__ZN19OZGradientGeneratorC1EP9OZFactoryRK8PCStringj:
00000000004f6560	pushq	%rbp
00000000004f6561	movq	%rsp, %rbp
00000000004f6564	pushq	%r15
00000000004f6566	pushq	%r14
00000000004f6568	pushq	%r12
00000000004f656a	pushq	%rbx
00000000004f656b	subq	$0x10, %rsp
00000000004f656f	movl	%ecx, %r14d
00000000004f6572	movq	%rsi, %r15
00000000004f6575	movq	%rdi, %rbx
00000000004f6578	movq	_kGradientFxPlugUUID(%rip), %rsi
00000000004f657f	leaq	-0x28(%rbp), %r12
00000000004f6583	movq	%r12, %rdi
00000000004f6586	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000004f658b	movq	%rbx, %rdi
00000000004f658e	movq	%r15, %rsi
00000000004f6591	movq	%r12, %rdx
00000000004f6594	movl	%r14d, %ecx
00000000004f6597	xorl	%r8d, %r8d
00000000004f659a	xorl	%r9d, %r9d
00000000004f659d	callq	__ZN13OZFxGeneratorC2EP9OZFactoryRK8PCStringjib ## OZFxGenerator::OZFxGenerator(OZFactory*, PCString const&, unsigned int, int, bool)
00000000004f65a2	leaq	-0x28(%rbp), %rdi
00000000004f65a6	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f65ab	leaq	0x382956(%rip), %rax
00000000004f65b2	movq	%rax, (%rbx)
00000000004f65b5	leaq	0x3832d4(%rip), %rax
00000000004f65bc	movq	%rax, 0x10(%rbx)
00000000004f65c0	leaq	0x383521(%rip), %rax
00000000004f65c7	movq	%rax, 0x28(%rbx)
00000000004f65cb	leaq	0x38356e(%rip), %rax
00000000004f65d2	movq	%rax, 0x1978(%rbx)
00000000004f65d9	leaq	0x383638(%rip), %rax
00000000004f65e0	movq	%rax, 0x4bb0(%rbx)
00000000004f65e7	addq	$0x10, %rsp
00000000004f65eb	popq	%rbx
00000000004f65ec	popq	%r12
00000000004f65ee	popq	%r14
00000000004f65f0	popq	%r15
00000000004f65f2	popq	%rbp
00000000004f65f3	retq
00000000004f65f4	movq	%rax, %rbx
00000000004f65f7	leaq	-0x28(%rbp), %rdi
00000000004f65fb	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000004f6600	movq	%rbx, %rdi
00000000004f6603	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004f6608	nopl	(%rax,%rax)
