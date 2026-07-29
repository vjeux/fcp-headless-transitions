__ZN34OZChannelPositionPercent3D_FactoryC2Ev:
00000000000a6826	pushq	%rbp
00000000000a6827	movq	%rsp, %rbp
00000000000a682a	pushq	%r14
00000000000a682c	pushq	%rbx
00000000000a682d	subq	$0x20, %rsp
00000000000a6831	movq	%rdi, %rbx
00000000000a6834	movaps	0xb355(%rip), %xmm0
00000000000a683b	leaq	-0x30(%rbp), %rsi
00000000000a683f	movaps	%xmm0, (%rsi)
00000000000a6842	movaps	0x8e97(%rip), %xmm0
00000000000a6849	leaq	-0x20(%rbp), %rdx
00000000000a684d	movaps	%xmm0, (%rdx)
00000000000a6850	movl	$0x1, %ecx
00000000000a6855	callq	__ZN9OZFactoryC2E6PCUUIDS0_j    ## OZFactory::OZFactory(PCUUID, PCUUID, unsigned int)
00000000000a685a	leaq	__ZTV16OZChannelFactory(%rip), %rax ## vtable for OZChannelFactory
00000000000a6861	addq	$0x10, %rax
00000000000a6865	movq	%rax, (%rbx)
00000000000a6868	leaq	0x80(%rbx), %rdi
00000000000a686f	xorl	%esi, %esi
00000000000a6871	callq	0xacb46                         ## symbol stub for: __ZN11PCSingletonC2Ej
00000000000a6876	leaq	__ZTV34OZChannelPositionPercent3D_Factory(%rip), %rax ## vtable for OZChannelPositionPercent3D_Factory
00000000000a687d	leaq	0x10(%rax), %rcx
00000000000a6881	movq	%rcx, (%rbx)
00000000000a6884	addq	$0xe0, %rax
00000000000a688a	movq	%rax, 0x80(%rbx)
00000000000a6891	addq	$0x20, %rsp
00000000000a6895	popq	%rbx
00000000000a6896	popq	%r14
00000000000a6898	popq	%rbp
00000000000a6899	retq
00000000000a689a	movq	%rax, %r14
00000000000a689d	movq	%rbx, %rdi
00000000000a68a0	callq	__ZN9OZFactoryD2Ev              ## OZFactory::~OZFactory()
00000000000a68a5	movq	%r14, %rdi
00000000000a68a8	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000a68ad	nop
