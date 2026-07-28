__ZN19OZChannelShearAngleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
0000000000087970	pushq	%rbp
0000000000087971	movq	%rsp, %rbp
0000000000087974	pushq	%r15
0000000000087976	pushq	%r14
0000000000087978	pushq	%r13
000000000008797a	pushq	%r12
000000000008797c	pushq	%rbx
000000000008797d	subq	$0x28, %rsp
0000000000087981	movq	%r9, %r15
0000000000087984	movl	%r8d, -0x30(%rbp)
0000000000087988	movl	%ecx, -0x2c(%rbp)
000000000008798b	movq	%rdx, %r13
000000000008798e	movq	%rsi, %r14
0000000000087991	movsd	%xmm0, -0x38(%rbp)
0000000000087996	movq	%rdi, %rbx
0000000000087999	movq	0x10(%rbp), %r12
000000000008799d	callq	__Z34getOZChannelShearAngle_FactoryBasev ## getOZChannelShearAngle_FactoryBase()
00000000000879a2	movq	%r12, 0x8(%rsp)
00000000000879a7	movq	%r15, -0x40(%rbp)
00000000000879ab	movq	%r15, (%rsp)
00000000000879af	movq	%rbx, %rdi
00000000000879b2	movq	%rax, %rsi
00000000000879b5	movq	%r14, %rdx
00000000000879b8	movq	%r13, %rcx
00000000000879bb	movl	-0x2c(%rbp), %r8d
00000000000879bf	movl	-0x30(%rbp), %r9d
00000000000879c3	callq	__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000879c8	leaq	__ZTV19OZChannelShearAngle(%rip), %rax ## vtable for OZChannelShearAngle
00000000000879cf	leaq	0x10(%rax), %rcx
00000000000879d3	movq	%rcx, (%rbx)
00000000000879d6	addq	$0x370, %rax                    ## imm = 0x370
00000000000879dc	movq	%rax, 0x10(%rbx)
00000000000879e0	callq	__ZN19OZChannelShearAngle29createOZChannelShearAngleInfoEv ## OZChannelShearAngle::createOZChannelShearAngleInfo()
00000000000879e5	cmpq	$0x0, 0x10(%rbp)
00000000000879ea	je	0x879f5
00000000000879ec	movq	0x88(%rbx), %rax
00000000000879f3	jmp	0x87a06
00000000000879f5	leaq	__ZN19OZChannelShearAngle24_OZChannelShearAngleInfoE(%rip), %rax ## OZChannelShearAngle::_OZChannelShearAngleInfo
00000000000879fc	movq	(%rax), %rax
00000000000879ff	movq	%rax, 0x88(%rbx)
0000000000087a06	movq	%rax, 0x80(%rbx)
0000000000087a0d	callq	__ZN19OZChannelShearAngle29createOZChannelShearAngleImplEv ## OZChannelShearAngle::createOZChannelShearAngleImpl()
0000000000087a12	cmpq	$0x0, -0x40(%rbp)
0000000000087a17	je	0x87a1f
0000000000087a19	movq	0x78(%rbx), %rax
0000000000087a1d	jmp	0x87a2d
0000000000087a1f	leaq	__ZN19OZChannelShearAngle24_OZChannelShearAngleImplE(%rip), %rax ## OZChannelShearAngle::_OZChannelShearAngleImpl
0000000000087a26	movq	(%rax), %rax
0000000000087a29	movq	%rax, 0x78(%rbx)
0000000000087a2d	movq	%rax, 0x70(%rbx)
0000000000087a31	movq	%rbx, %rdi
0000000000087a34	movsd	-0x38(%rbp), %xmm0
0000000000087a39	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000087a3e	movq	%rbx, %rdi
0000000000087a41	movsd	-0x38(%rbp), %xmm0
0000000000087a46	xorl	%esi, %esi
0000000000087a48	callq	__ZN9OZChannel15setInitialValueEdb ## OZChannel::setInitialValue(double, bool)
0000000000087a4d	addq	$0x28, %rsp
0000000000087a51	popq	%rbx
0000000000087a52	popq	%r12
0000000000087a54	popq	%r13
0000000000087a56	popq	%r14
0000000000087a58	popq	%r15
0000000000087a5a	popq	%rbp
0000000000087a5b	retq
0000000000087a5c	movq	%rax, %r14
0000000000087a5f	movq	%rbx, %rdi
0000000000087a62	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000087a67	movq	%r14, %rdi
0000000000087a6a	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000087a6f	nop
