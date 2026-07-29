__ZN34OZChannelPositionPercent3D_Factory6createERK8PCStringj:
00000000000a68fe	pushq	%rbp
00000000000a68ff	movq	%rsp, %rbp
00000000000a6902	pushq	%r15
00000000000a6904	pushq	%r14
00000000000a6906	pushq	%r12
00000000000a6908	pushq	%rbx
00000000000a6909	movl	%edx, %r14d
00000000000a690c	movq	%rsi, %r15
00000000000a690f	movq	%rdi, %r12
00000000000a6912	movl	$0x378, %edi                    ## imm = 0x378
00000000000a6917	callq	0xace4c                         ## symbol stub for: __Znwm
00000000000a691c	movq	%rax, %rbx
00000000000a691f	movq	%rax, %rdi
00000000000a6922	movq	%r12, %rsi
00000000000a6925	movq	%r15, %rdx
00000000000a6928	movl	%r14d, %ecx
00000000000a692b	callq	__ZN26OZChannelPositionPercent3DC2EP9OZFactoryRK8PCStringj ## OZChannelPositionPercent3D::OZChannelPositionPercent3D(OZFactory*, PCString const&, unsigned int)
00000000000a6930	movq	%rbx, %rax
00000000000a6933	popq	%rbx
00000000000a6934	popq	%r12
00000000000a6936	popq	%r14
00000000000a6938	popq	%r15
00000000000a693a	popq	%rbp
00000000000a693b	retq
00000000000a693c	movq	%rax, %r14
00000000000a693f	movq	%rbx, %rdi
00000000000a6942	callq	0xace04                         ## symbol stub for: __ZdlPv
00000000000a6947	movq	%r14, %rdi
00000000000a694a	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000a694f	nop
