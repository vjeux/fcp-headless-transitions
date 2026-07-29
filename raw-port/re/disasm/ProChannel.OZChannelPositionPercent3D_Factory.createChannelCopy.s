__ZN34OZChannelPositionPercent3D_Factory17createChannelCopyEP13OZChannelBasej:
00000000000a6b16	pushq	%rbp
00000000000a6b17	movq	%rsp, %rbp
00000000000a6b1a	pushq	%r14
00000000000a6b1c	pushq	%rbx
00000000000a6b1d	movq	%rsi, %r14
00000000000a6b20	movl	$0x378, %edi                    ## imm = 0x378
00000000000a6b25	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000a6b2a	movq	%rax, %rbx
00000000000a6b2d	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
00000000000a6b34	leaq	__ZTI26OZChannelPositionPercent3D(%rip), %rdx ## typeinfo for OZChannelPositionPercent3D
00000000000a6b3b	movq	%r14, %rdi
00000000000a6b3e	xorl	%ecx, %ecx
00000000000a6b40	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
00000000000a6b45	movq	%rbx, %rdi
00000000000a6b48	movq	%rax, %rsi
00000000000a6b4b	xorl	%edx, %edx
00000000000a6b4d	callq	__ZN19OZChannelPosition3DC2ERKS_P15OZChannelFolder ## OZChannelPosition3D::OZChannelPosition3D(OZChannelPosition3D const&, OZChannelFolder*)
00000000000a6b52	leaq	0x3c42f(%rip), %rax
00000000000a6b59	movq	%rax, (%rbx)
00000000000a6b5c	leaq	0x3c76d(%rip), %rax
00000000000a6b63	movq	%rax, 0x10(%rbx)
00000000000a6b67	movq	%rbx, %rax
00000000000a6b6a	popq	%rbx
00000000000a6b6b	popq	%r14
00000000000a6b6d	popq	%rbp
00000000000a6b6e	retq
00000000000a6b6f	movq	%rax, %r14
00000000000a6b72	movq	%rbx, %rdi
00000000000a6b75	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000a6b7a	movq	%r14, %rdi
00000000000a6b7d	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
