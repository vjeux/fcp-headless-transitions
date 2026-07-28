__ZN11PCGenVectorIfEC2Eif:
00000000000ba362	pushq	%rbp
00000000000ba363	movq	%rsp, %rbp
00000000000ba366	pushq	%r15
00000000000ba368	pushq	%r14
00000000000ba36a	pushq	%rbx
00000000000ba36b	subq	$0x18, %rsp
00000000000ba36f	movss	%xmm0, -0x24(%rbp)
00000000000ba374	movl	%esi, %r15d
00000000000ba377	movq	%rdi, %rbx
00000000000ba37a	callq	__ZN13PCGenBlockRefIfEC2Ei      ## PCGenBlockRef<float>::PCGenBlockRef(int)
00000000000ba37f	movl	%r15d, 0x8(%rbx)
00000000000ba383	movl	$0x1, 0xc(%rbx)
00000000000ba38a	testl	%r15d, %r15d
00000000000ba38d	js	0xba3bc
00000000000ba38f	movq	(%rbx), %rax
00000000000ba392	movq	%rax, 0x10(%rbx)
00000000000ba396	movss	-0x24(%rbp), %xmm0
00000000000ba39b	je	0xba3b1
00000000000ba39d	incl	%r15d
00000000000ba3a0	movss	%xmm0, (%rax)
00000000000ba3a4	addq	$0x4, %rax
00000000000ba3a8	decl	%r15d
00000000000ba3ab	cmpl	$0x1, %r15d
00000000000ba3af	ja	0xba3a0
00000000000ba3b1	addq	$0x18, %rsp
00000000000ba3b5	popq	%rbx
00000000000ba3b6	popq	%r14
00000000000ba3b8	popq	%r15
00000000000ba3ba	popq	%rbp
00000000000ba3bb	retq
00000000000ba3bc	movl	$0x40, %edi
00000000000ba3c1	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000ba3c6	movq	%rax, %r14
00000000000ba3c9	leaq	0x7b748(%rip), %rsi             ## literal pool for: "PCGenVector length %d must be nonnegative"
00000000000ba3d0	leaq	-0x20(%rbp), %rdi
00000000000ba3d4	movl	%r15d, %edx
00000000000ba3d7	xorl	%eax, %eax
00000000000ba3d9	callq	__ZN8PCString8ssprintfEPKcz     ## PCString::ssprintf(char const*, ...)
00000000000ba3de	leaq	-0x20(%rbp), %rsi
00000000000ba3e2	movq	%r14, %rdi
00000000000ba3e5	callq	__ZN11PCExceptionC2ERK8PCString ## PCException::PCException(PCString const&)
00000000000ba3ea	leaq	0x92437(%rip), %rax
00000000000ba3f1	movq	%rax, (%r14)
00000000000ba3f4	leaq	__ZTI22PCMatrixErrorException(%rip), %rsi ## typeinfo for PCMatrixErrorException
00000000000ba3fb	leaq	__ZN22PCMatrixErrorExceptionD1Ev(%rip), %rdx ## PCMatrixErrorException::~PCMatrixErrorException()
00000000000ba402	movq	%r14, %rdi
00000000000ba405	callq	0xde71a                         ## symbol stub for: ___cxa_throw
00000000000ba40a	ud2
00000000000ba40c	movq	%rax, %r15
00000000000ba40f	leaq	-0x20(%rbp), %rdi
00000000000ba413	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000ba418	jmp	0xba433
00000000000ba41a	movq	%rax, %r15
00000000000ba41d	leaq	-0x20(%rbp), %rdi
00000000000ba421	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
00000000000ba426	jmp	0xba42b
00000000000ba428	movq	%rax, %r15
00000000000ba42b	movq	%r14, %rdi
00000000000ba42e	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
00000000000ba433	movq	%rbx, %rdi
00000000000ba436	callq	__ZN13PCGenBlockRefIfED2Ev      ## PCGenBlockRef<float>::~PCGenBlockRef()
00000000000ba43b	movq	%r15, %rdi
00000000000ba43e	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
