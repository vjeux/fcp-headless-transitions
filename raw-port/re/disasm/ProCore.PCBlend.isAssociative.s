__ZN7PCBlend13isAssociativeE11PCBlendMode:
0000000000017f17	pushq	%rbp
0000000000017f18	movq	%rsp, %rbp
0000000000017f1b	pushq	%r15
0000000000017f1d	pushq	%r14
0000000000017f1f	pushq	%rbx
0000000000017f20	subq	$0x18, %rsp
0000000000017f24	cmpl	$0x33, %edi
0000000000017f27	ja	0x17fda
0000000000017f2d	movl	%edi, %ecx
0000000000017f2f	movabsq	$0x53e5fd864, %rax              ## imm = 0x53E5FD864
0000000000017f39	btq	%rcx, %rax
0000000000017f3d	jae	0x17f43
0000000000017f3f	xorl	%eax, %eax
0000000000017f41	jmp	0x17f55
0000000000017f43	movb	$0x1, %al
0000000000017f45	movabsq	$0x1000880800719, %rdx          ## imm = 0x1000880800719
0000000000017f4f	btq	%rcx, %rdx
0000000000017f53	jae	0x17f60
0000000000017f55	addq	$0x18, %rsp
0000000000017f59	popq	%rbx
0000000000017f5a	popq	%r14
0000000000017f5c	popq	%r15
0000000000017f5e	popq	%rbp
0000000000017f5f	retq
0000000000017f60	movabsq	$0xeffc000000000, %rax          ## imm = 0xEFFC000000000
0000000000017f6a	btq	%rcx, %rax
0000000000017f6e	jae	0x17fda
0000000000017f70	movl	$0x40, %edi
0000000000017f75	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
0000000000017f7a	movq	%rax, %rbx
0000000000017f7d	leaq	0x119717(%rip), %rsi            ## literal pool for: "not implemented yet"
0000000000017f84	leaq	-0x20(%rbp), %rdi
0000000000017f88	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
0000000000017f8d	leaq	0x11971b(%rip), %rsi            ## literal pool for: "/Library/Caches/com.apple.xbs/Sources/ProCore/ProCore-45000.0.33/PCBlend.cpp"
0000000000017f94	leaq	-0x28(%rbp), %rdi
0000000000017f98	callq	__ZN8PCStringC1EPKc             ## PCString::PCString(char const*)
0000000000017f9d	movb	$0x1, %r15b
0000000000017fa0	leaq	-0x20(%rbp), %rsi
0000000000017fa4	leaq	-0x28(%rbp), %rdx
0000000000017fa8	movq	%rbx, %rdi
0000000000017fab	movl	$0x1f0, %ecx                    ## imm = 0x1F0
0000000000017fb0	callq	__ZN11PCExceptionC2ERK8PCStringS2_i ## PCException::PCException(PCString const&, PCString const&, int)
0000000000017fb5	leaq	0x131294(%rip), %rax
0000000000017fbc	movq	%rax, (%rbx)
0000000000017fbf	xorl	%r15d, %r15d
0000000000017fc2	leaq	__ZTI31PCUnsupportedOperationException(%rip), %rsi ## typeinfo for PCUnsupportedOperationException
0000000000017fc9	leaq	__ZN31PCUnsupportedOperationExceptionD1Ev(%rip), %rdx ## PCUnsupportedOperationException::~PCUnsupportedOperationException()
0000000000017fd0	movq	%rbx, %rdi
0000000000017fd3	callq	0xde71a                         ## symbol stub for: ___cxa_throw
0000000000017fd8	ud2
0000000000017fda	movl	$0x40, %edi
0000000000017fdf	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
0000000000017fe4	movq	%rax, %rbx
0000000000017fe7	movq	%rax, %rdi
0000000000017fea	callq	__ZN26PCIllegalArgumentExceptionC1Ev ## PCIllegalArgumentException::PCIllegalArgumentException()
0000000000017fef	movq	%rbx, %rdi
0000000000017ff2	callq	__ZN7PCBlend13isAssociativeE11PCBlendMode.cold.1 ## PCBlend::isAssociative(PCBlendMode) (.cold.1)
0000000000017ff7	jmp	0x18023
0000000000017ff9	movq	%rax, %r14
0000000000017ffc	leaq	-0x28(%rbp), %rdi
0000000000018000	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000018005	leaq	-0x20(%rbp), %rdi
0000000000018009	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
000000000001800e	testb	%r15b, %r15b
0000000000018011	jne	0x18026
0000000000018013	jmp	0x1802e
0000000000018015	movq	%rax, %r14
0000000000018018	leaq	-0x20(%rbp), %rdi
000000000001801c	callq	__ZN8PCStringD1Ev               ## PCString::~PCString()
0000000000018021	jmp	0x18026
0000000000018023	movq	%rax, %r14
0000000000018026	movq	%rbx, %rdi
0000000000018029	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
000000000001802e	movq	%r14, %rdi
0000000000018031	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
