__ZN16OZChannelScale3D4copyEPK13OZChannelBaseb:
0000000000086dd2	pushq	%rbp
0000000000086dd3	movq	%rsp, %rbp
0000000000086dd6	pushq	%r15
0000000000086dd8	pushq	%r14
0000000000086dda	pushq	%rbx
0000000000086ddb	pushq	%rax
0000000000086ddc	movl	%edx, %ebx
0000000000086dde	movq	%rsi, %r14
0000000000086de1	movq	%rdi, %r15
0000000000086de4	callq	__ZN11OZChannel2D4copyEPK13OZChannelBaseb ## OZChannel2D::copy(OZChannelBase const*, bool)
0000000000086de9	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
0000000000086df0	leaq	__ZTI16OZChannelScale3D(%rip), %rdx ## typeinfo for OZChannelScale3D
0000000000086df7	movq	%r14, %rdi
0000000000086dfa	xorl	%ecx, %ecx
0000000000086dfc	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
0000000000086e01	movl	$0x1b8, %esi                    ## imm = 0x1B8
0000000000086e06	addq	%rsi, %r15
0000000000086e09	addq	%rax, %rsi
0000000000086e0c	movq	%r15, %rdi
0000000000086e0f	movl	%ebx, %edx
0000000000086e11	addq	$0x8, %rsp
0000000000086e15	popq	%rbx
0000000000086e16	popq	%r14
0000000000086e18	popq	%r15
0000000000086e1a	popq	%rbp
0000000000086e1b	jmp	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
