__ZN34OZChannelPositionPercent3D_Factory10createCopyEP13OZFactoryBasej:
00000000000a6950	pushq	%rbp
00000000000a6951	movq	%rsp, %rbp
00000000000a6954	pushq	%r14
00000000000a6956	pushq	%rbx
00000000000a6957	movq	%rsi, %r14
00000000000a695a	movl	$0x378, %edi                    ## imm = 0x378
00000000000a695f	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000a6964	movq	%rax, %rbx
00000000000a6967	movq	0x23ed2(%rip), %rsi             ## literal pool symbol address: __ZTI13OZFactoryBase
00000000000a696e	leaq	__ZTI26OZChannelPositionPercent3D(%rip), %rdx ## typeinfo for OZChannelPositionPercent3D
00000000000a6975	movq	%r14, %rdi
00000000000a6978	xorl	%ecx, %ecx
00000000000a697a	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
00000000000a697f	movq	%rbx, %rdi
00000000000a6982	movq	%rax, %rsi
00000000000a6985	xorl	%edx, %edx
00000000000a6987	callq	__ZN19OZChannelPosition3DC2ERKS_P15OZChannelFolder ## OZChannelPosition3D::OZChannelPosition3D(OZChannelPosition3D const&, OZChannelFolder*)
00000000000a698c	leaq	0x3c5f5(%rip), %rax
00000000000a6993	movq	%rax, (%rbx)
00000000000a6996	leaq	0x3c933(%rip), %rax
00000000000a699d	movq	%rax, 0x10(%rbx)
00000000000a69a1	movq	%rbx, %rax
00000000000a69a4	popq	%rbx
00000000000a69a5	popq	%r14
00000000000a69a7	popq	%rbp
00000000000a69a8	retq
00000000000a69a9	movq	%rax, %r14
00000000000a69ac	movq	%rbx, %rdi
00000000000a69af	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000a69b4	movq	%r14, %rdi
00000000000a69b7	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
