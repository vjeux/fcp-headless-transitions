__ZN19OZChannelShearAngleC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo:
00000000000055f4	pushq	%rbp
00000000000055f5	movq	%rsp, %rbp
00000000000055f8	pushq	%r15
00000000000055fa	pushq	%r14
00000000000055fc	pushq	%rbx
00000000000055fd	subq	$0x18, %rsp
0000000000005601	movq	%r9, %r15
0000000000005604	movq	%r8, %r14
0000000000005607	movl	%ecx, %r8d
000000000000560a	movq	%rdi, %rbx
000000000000560d	movq	%r9, 0x8(%rsp)
0000000000005612	movq	%r14, (%rsp)
0000000000005616	xorl	%ecx, %ecx
0000000000005618	xorl	%r9d, %r9d
000000000000561b	callq	__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000005620	leaq	__ZTV19OZChannelShearAngle(%rip), %rax ## vtable for OZChannelShearAngle
0000000000005627	leaq	0x10(%rax), %rcx
000000000000562b	movq	%rcx, (%rbx)
000000000000562e	addq	$0x370, %rax                    ## imm = 0x370
0000000000005634	movq	%rax, 0x10(%rbx)
0000000000005638	callq	__ZN19OZChannelShearAngle29createOZChannelShearAngleInfoEv ## OZChannelShearAngle::createOZChannelShearAngleInfo()
000000000000563d	testq	%r15, %r15
0000000000005640	je	0x564b
0000000000005642	movq	0x88(%rbx), %rax
0000000000005649	jmp	0x565c
000000000000564b	leaq	__ZN19OZChannelShearAngle24_OZChannelShearAngleInfoE(%rip), %rax ## OZChannelShearAngle::_OZChannelShearAngleInfo
0000000000005652	movq	(%rax), %rax
0000000000005655	movq	%rax, 0x88(%rbx)
000000000000565c	movq	%rax, 0x80(%rbx)
0000000000005663	callq	__ZN19OZChannelShearAngle29createOZChannelShearAngleImplEv ## OZChannelShearAngle::createOZChannelShearAngleImpl()
0000000000005668	testq	%r14, %r14
000000000000566b	je	0x5673
000000000000566d	movq	0x78(%rbx), %rax
0000000000005671	jmp	0x5681
0000000000005673	leaq	__ZN19OZChannelShearAngle24_OZChannelShearAngleImplE(%rip), %rax ## OZChannelShearAngle::_OZChannelShearAngleImpl
000000000000567a	movq	(%rax), %rax
000000000000567d	movq	%rax, 0x78(%rbx)
0000000000005681	movq	%rax, 0x70(%rbx)
0000000000005685	addq	$0x18, %rsp
0000000000005689	popq	%rbx
000000000000568a	popq	%r14
000000000000568c	popq	%r15
000000000000568e	popq	%rbp
000000000000568f	retq
0000000000005690	movq	%rax, %r14
0000000000005693	movq	%rbx, %rdi
0000000000005696	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000000569b	movq	%r14, %rdi
000000000000569e	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000056a3	nop
