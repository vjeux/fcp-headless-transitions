__ZN19OZChannelShearAngleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo:
0000000000087892	pushq	%rbp
0000000000087893	movq	%rsp, %rbp
0000000000087896	pushq	%r15
0000000000087898	pushq	%r14
000000000008789a	pushq	%r13
000000000008789c	pushq	%r12
000000000008789e	pushq	%rbx
000000000008789f	subq	$0x28, %rsp
00000000000878a3	movq	%r9, %r15
00000000000878a6	movl	%r8d, -0x2c(%rbp)
00000000000878aa	movl	%ecx, %r12d
00000000000878ad	movq	%rdx, %r13
00000000000878b0	movq	%rsi, %r14
00000000000878b3	movq	%rdi, %rbx
00000000000878b6	callq	__Z34getOZChannelShearAngle_FactoryBasev ## getOZChannelShearAngle_FactoryBase()
00000000000878bb	movq	0x10(%rbp), %rcx
00000000000878bf	movq	%rcx, 0x8(%rsp)
00000000000878c4	movq	%r15, -0x38(%rbp)
00000000000878c8	movq	%r15, (%rsp)
00000000000878cc	movq	%rbx, %rdi
00000000000878cf	movq	%rax, %rsi
00000000000878d2	movq	%r14, %rdx
00000000000878d5	movq	%r13, %rcx
00000000000878d8	movl	%r12d, %r8d
00000000000878db	movl	-0x2c(%rbp), %r9d
00000000000878df	callq	__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000878e4	leaq	__ZTV19OZChannelShearAngle(%rip), %rax ## vtable for OZChannelShearAngle
00000000000878eb	leaq	0x10(%rax), %rcx
00000000000878ef	movq	%rcx, (%rbx)
00000000000878f2	addq	$0x370, %rax                    ## imm = 0x370
00000000000878f8	movq	%rax, 0x10(%rbx)
00000000000878fc	callq	__ZN19OZChannelShearAngle29createOZChannelShearAngleInfoEv ## OZChannelShearAngle::createOZChannelShearAngleInfo()
0000000000087901	cmpq	$0x0, 0x10(%rbp)
0000000000087906	je	0x87911
0000000000087908	movq	0x88(%rbx), %rax
000000000008790f	jmp	0x87922
0000000000087911	leaq	__ZN19OZChannelShearAngle24_OZChannelShearAngleInfoE(%rip), %rax ## OZChannelShearAngle::_OZChannelShearAngleInfo
0000000000087918	movq	(%rax), %rax
000000000008791b	movq	%rax, 0x88(%rbx)
0000000000087922	movq	%rax, 0x80(%rbx)
0000000000087929	callq	__ZN19OZChannelShearAngle29createOZChannelShearAngleImplEv ## OZChannelShearAngle::createOZChannelShearAngleImpl()
000000000008792e	cmpq	$0x0, -0x38(%rbp)
0000000000087933	je	0x8793b
0000000000087935	movq	0x78(%rbx), %rax
0000000000087939	jmp	0x87949
000000000008793b	leaq	__ZN19OZChannelShearAngle24_OZChannelShearAngleImplE(%rip), %rax ## OZChannelShearAngle::_OZChannelShearAngleImpl
0000000000087942	movq	(%rax), %rax
0000000000087945	movq	%rax, 0x78(%rbx)
0000000000087949	movq	%rax, 0x70(%rbx)
000000000008794d	addq	$0x28, %rsp
0000000000087951	popq	%rbx
0000000000087952	popq	%r12
0000000000087954	popq	%r13
0000000000087956	popq	%r14
0000000000087958	popq	%r15
000000000008795a	popq	%rbp
000000000008795b	retq
000000000008795c	movq	%rax, %r14
000000000008795f	movq	%rbx, %rdi
0000000000087962	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000087967	movq	%r14, %rdi
000000000008796a	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
000000000008796f	nop
