__ZN11PCGenVectorIfEclEi:
00000000000b7e3e	pushq	%rbp
00000000000b7e3f	movq	%rsp, %rbp
00000000000b7e42	pushq	%r15
00000000000b7e44	pushq	%r14
00000000000b7e46	pushq	%rbx
00000000000b7e47	pushq	%rax
00000000000b7e48	movl	%esi, %r14d
00000000000b7e4b	movq	%rdi, %r15
00000000000b7e4e	testl	%esi, %esi
00000000000b7e50	js	0xb7e76
00000000000b7e52	cmpl	0x8(%r15), %r14d
00000000000b7e56	jge	0xb7e76
00000000000b7e58	movslq	0xc(%r15), %rcx
00000000000b7e5c	movslq	%r14d, %rax
00000000000b7e5f	imulq	%rcx, %rax
00000000000b7e63	shlq	$0x2, %rax
00000000000b7e67	addq	0x10(%r15), %rax
00000000000b7e6b	addq	$0x8, %rsp
00000000000b7e6f	popq	%rbx
00000000000b7e70	popq	%r14
00000000000b7e72	popq	%r15
00000000000b7e74	popq	%rbp
00000000000b7e75	retq
00000000000b7e76	movl	$0x40, %edi
00000000000b7e7b	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000b7e80	movq	%rax, %rbx
00000000000b7e83	movl	0x8(%r15), %ecx
00000000000b7e87	decl	%ecx
00000000000b7e89	leaq	0x7dcb2(%rip), %rsi             ## literal pool for: "PCGenVector index %d out of range %d"
00000000000b7e90	leaq	-0x20(%rbp), %rdi
00000000000b7e94	movl	%r14d, %edx
00000000000b7e97	xorl	%eax, %eax
00000000000b7e99	callq	__ZN8PCString8ssprintfEPKcz     ## PCString::ssprintf(char const*, ...)
00000000000b7e9e	leaq	-0x20(%rbp), %rsi
00000000000b7ea2	movq	%rbx, %rdi
00000000000b7ea5	callq	__ZN11PCExceptionC2ERK8PCString ## PCException::PCException(PCString const&)
00000000000b7eaa	leaq	0x94977(%rip), %rax
00000000000b7eb1	movq	%rax, (%rbx)
00000000000b7eb4	leaq	__ZTI22PCMatrixErrorException(%rip), %rsi ## typeinfo for PCMatrixErrorException
00000000000b7ebb	leaq	__ZN22PCMatrixErrorExceptionD1Ev(%rip), %rdx ## PCMatrixErrorException::~PCMatrixErrorException()
00000000000b7ec2	movq	%rbx, %rdi
00000000000b7ec5	callq	0xde71a                         ## symbol stub for: ___cxa_throw
00000000000b7eca	ud2
00000000000b7ecc	movq	%rax, %r14
00000000000b7ecf	leaq	-0x20(%rbp), %rdi
00000000000b7ed3	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000b7ed8	jmp	0xb7ef3
00000000000b7eda	movq	%rax, %r14
00000000000b7edd	leaq	-0x20(%rbp), %rdi
00000000000b7ee1	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000b7ee6	jmp	0xb7eeb
00000000000b7ee8	movq	%rax, %r14
00000000000b7eeb	movq	%rbx, %rdi
00000000000b7eee	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
00000000000b7ef3	movq	%r14, %rdi
00000000000b7ef6	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
00000000000b7efb	nop
