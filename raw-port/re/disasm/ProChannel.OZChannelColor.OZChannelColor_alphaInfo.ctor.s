__ZN14OZChannelColor24OZChannelColor_alphaInfoC2Ev:
0000000000054b66	pushq	%rbp
0000000000054b67	movq	%rsp, %rbp
0000000000054b6a	pushq	%r14
0000000000054b6c	pushq	%rbx
0000000000054b6d	subq	$0x10, %rsp
0000000000054b71	movq	%rdi, %rbx
0000000000054b74	leaq	0x6787d(%rip), %rsi             ## literal pool for: ""
0000000000054b7b	leaq	-0x18(%rbp), %r14
0000000000054b7f	movq	%r14, %rdi
0000000000054b82	callq	0xacd08                         ## symbol stub for: __ZN8PCStringC1EPKc
0000000000054b87	movsd	0x5a991(%rip), %xmm2
0000000000054b8f	movsd	0x5b981(%rip), %xmm3
0000000000054b97	movsd	0x5a989(%rip), %xmm1
0000000000054b9f	xorps	%xmm0, %xmm0
0000000000054ba2	movq	%rbx, %rdi
0000000000054ba5	movaps	%xmm1, %xmm4
0000000000054ba8	movq	%r14, %rsi
0000000000054bab	callq	__ZN13OZChannelInfoC2EdddddRK8PCString ## OZChannelInfo::OZChannelInfo(double, double, double, double, double, PCString const&)
0000000000054bb0	leaq	-0x18(%rbp), %rdi
0000000000054bb4	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000054bb9	leaq	0x50(%rbx), %rdi
0000000000054bbd	movl	$0x64, %esi
0000000000054bc2	callq	0xacb46                         ## symbol stub for: __ZN11PCSingletonC2Ej
0000000000054bc7	leaq	__ZTVN14OZChannelColor24OZChannelColor_alphaInfoE(%rip), %rax ## vtable for OZChannelColor::OZChannelColor_alphaInfo
0000000000054bce	leaq	0x10(%rax), %rcx
0000000000054bd2	movq	%rcx, (%rbx)
0000000000054bd5	addq	$0x30, %rax
0000000000054bd9	movq	%rax, 0x50(%rbx)
0000000000054bdd	addq	$0x10, %rsp
0000000000054be1	popq	%rbx
0000000000054be2	popq	%r14
0000000000054be4	popq	%rbp
0000000000054be5	retq
0000000000054be6	movq	%rax, %r14
0000000000054be9	movq	%rbx, %rdi
0000000000054bec	callq	__ZN13OZChannelInfoD2Ev         ## OZChannelInfo::~OZChannelInfo()
0000000000054bf1	jmp	0x54bff
0000000000054bf3	movq	%rax, %r14
0000000000054bf6	leaq	-0x18(%rbp), %rdi
0000000000054bfa	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000054bff	movq	%r14, %rdi
0000000000054c02	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000054c07	nop
