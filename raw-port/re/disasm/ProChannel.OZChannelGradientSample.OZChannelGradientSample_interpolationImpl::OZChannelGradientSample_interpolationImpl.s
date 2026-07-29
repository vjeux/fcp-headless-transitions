__ZN23OZChannelGradientSample41OZChannelGradientSample_interpolationImplC2Ev:
000000000006ee58	pushq	%rbp
000000000006ee59	movq	%rsp, %rbp
000000000006ee5c	pushq	%r15
000000000006ee5e	pushq	%r14
000000000006ee60	pushq	%rbx
000000000006ee61	pushq	%rax
000000000006ee62	movq	%rdi, %rbx
000000000006ee65	movsd	0x41783(%rip), %xmm0
000000000006ee6d	callq	__ZN13OZChannelEnum24createOZChannelEnumCurveEd ## OZChannelEnum::createOZChannelEnumCurve(double)
000000000006ee72	movq	%rbx, %rdi
000000000006ee75	movq	%rax, %rsi
000000000006ee78	movsd	0x41770(%rip), %xmm0
000000000006ee80	xorl	%edx, %edx
000000000006ee82	movl	$0x1, %ecx
000000000006ee87	callq	__ZN13OZChannelImplC2EP7OZCurvedjb ## OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool)
000000000006ee8c	leaq	0x28(%rbx), %r14
000000000006ee90	movq	%r14, %rdi
000000000006ee93	movl	$0x32, %esi
000000000006ee98	callq	0xacb46                         ## symbol stub for: __ZN11PCSingletonC2Ej
000000000006ee9d	leaq	__ZTVN23OZChannelGradientSample41OZChannelGradientSample_interpolationImplE(%rip), %rax ## vtable for OZChannelGradientSample::OZChannelGradientSample_interpolationImpl
000000000006eea4	leaq	0x10(%rax), %rcx
000000000006eea8	movq	%rcx, (%rbx)
000000000006eeab	addq	$0x30, %rax
000000000006eeaf	movq	%rax, 0x28(%rbx)
000000000006eeb3	xorps	%xmm0, %xmm0
000000000006eeb6	movq	%rbx, %rdi
000000000006eeb9	callq	__ZN13OZChannelImpl6setMinEd    ## OZChannelImpl::setMin(double)
000000000006eebe	movsd	0x4067a(%rip), %xmm0
000000000006eec6	movq	%rbx, %rdi
000000000006eec9	callq	__ZN13OZChannelImpl6setMaxEd    ## OZChannelImpl::setMax(double)
000000000006eece	addq	$0x8, %rsp
000000000006eed2	popq	%rbx
000000000006eed3	popq	%r14
000000000006eed5	popq	%r15
000000000006eed7	popq	%rbp
000000000006eed8	retq
000000000006eed9	movq	%rax, %r15
000000000006eedc	jmp	0x6eee9
000000000006eede	movq	%rax, %r15
000000000006eee1	movq	%r14, %rdi
000000000006eee4	callq	0xacb4c                         ## symbol stub for: __ZN11PCSingletonD2Ev
000000000006eee9	movq	%rbx, %rdi
000000000006eeec	callq	__ZN13OZChannelImplD2Ev         ## OZChannelImpl::~OZChannelImpl()
000000000006eef1	movq	%r15, %rdi
000000000006eef4	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000006eef9	nop
