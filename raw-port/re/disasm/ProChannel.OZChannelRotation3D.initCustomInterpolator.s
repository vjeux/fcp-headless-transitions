__ZN19OZChannelRotation3D22initCustomInterpolatorEv:
0000000000080d0c	pushq	%rbp
0000000000080d0d	movq	%rsp, %rbp
0000000000080d10	pushq	%r15
0000000000080d12	pushq	%r14
0000000000080d14	pushq	%r12
0000000000080d16	pushq	%rbx
0000000000080d17	movq	%rdi, %rbx
0000000000080d1a	movq	__ZN19OZChannelRotation3D13_interpolatorE(%rip), %r14 ## OZChannelRotation3D::_interpolator
0000000000080d21	testq	%r14, %r14
0000000000080d24	jne	0x80d59
0000000000080d26	movl	$0x18, %edi
0000000000080d2b	callq	0xace4c                         ## symbol stub for: __Znwm
0000000000080d30	movq	%rax, %r14
0000000000080d33	movq	%rax, %rdi
0000000000080d36	callq	__ZN14OZInterpolatorC2Ev        ## OZInterpolator::OZInterpolator()
0000000000080d3b	leaq	0x5de66(%rip), %rax
0000000000080d42	movq	%rax, (%r14)
0000000000080d45	movb	$0x0, 0x10(%r14)
0000000000080d4a	movl	$0x0, 0x14(%r14)
0000000000080d52	movq	%r14, __ZN19OZChannelRotation3D13_interpolatorE(%rip) ## OZChannelRotation3D::_interpolator
0000000000080d59	leaq	0x88(%rbx), %r15
0000000000080d60	leaq	0x350(%rbx), %r12
0000000000080d67	movq	%r15, %rdi
0000000000080d6a	movq	%r14, %rsi
0000000000080d6d	movq	%r12, %rdx
0000000000080d70	callq	__ZN9OZChannel21setCustomInterpolatorEP20OZCustomInterpolatorP10PCSpinLock ## OZChannel::setCustomInterpolator(OZCustomInterpolator*, PCSpinLock*)
0000000000080d75	leaq	0x120(%rbx), %r14
0000000000080d7c	movq	__ZN19OZChannelRotation3D13_interpolatorE(%rip), %rsi ## OZChannelRotation3D::_interpolator
0000000000080d83	movq	%r14, %rdi
0000000000080d86	movq	%r12, %rdx
0000000000080d89	callq	__ZN9OZChannel21setCustomInterpolatorEP20OZCustomInterpolatorP10PCSpinLock ## OZChannel::setCustomInterpolator(OZCustomInterpolator*, PCSpinLock*)
0000000000080d8e	addq	$0x1b8, %rbx                    ## imm = 0x1B8
0000000000080d95	movq	__ZN19OZChannelRotation3D13_interpolatorE(%rip), %rsi ## OZChannelRotation3D::_interpolator
0000000000080d9c	movq	%rbx, %rdi
0000000000080d9f	movq	%r12, %rdx
0000000000080da2	callq	__ZN9OZChannel21setCustomInterpolatorEP20OZCustomInterpolatorP10PCSpinLock ## OZChannel::setCustomInterpolator(OZCustomInterpolator*, PCSpinLock*)
0000000000080da7	movq	%r15, %rdi
0000000000080daa	movq	%r15, %rsi
0000000000080dad	callq	__ZN9OZChannel15setOwnerChannelEPS_ ## OZChannel::setOwnerChannel(OZChannel*)
0000000000080db2	movq	%r14, %rdi
0000000000080db5	movq	%r14, %rsi
0000000000080db8	callq	__ZN9OZChannel15setOwnerChannelEPS_ ## OZChannel::setOwnerChannel(OZChannel*)
0000000000080dbd	movq	%rbx, %rdi
0000000000080dc0	movq	%rbx, %rsi
0000000000080dc3	popq	%rbx
0000000000080dc4	popq	%r12
0000000000080dc6	popq	%r14
0000000000080dc8	popq	%r15
0000000000080dca	popq	%rbp
0000000000080dcb	jmp	__ZN9OZChannel15setOwnerChannelEPS_ ## OZChannel::setOwnerChannel(OZChannel*)
0000000000080dd0	movq	%rax, %rbx
0000000000080dd3	movq	%r14, %rdi
0000000000080dd6	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000080ddb	movq	%rbx, %rdi
0000000000080dde	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000080de3	nop
