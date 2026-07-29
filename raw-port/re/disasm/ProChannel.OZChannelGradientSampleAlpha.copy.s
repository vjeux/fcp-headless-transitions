__ZN28OZChannelGradientSampleAlpha4copyEPK13OZChannelBaseb:
000000000006ed60	pushq	%rbp
000000000006ed61	movq	%rsp, %rbp
000000000006ed64	pushq	%r15
000000000006ed66	pushq	%r14
000000000006ed68	pushq	%rbx
000000000006ed69	pushq	%rax
000000000006ed6a	movl	%edx, %ebx
000000000006ed6c	movq	%rsi, %r14
000000000006ed6f	movq	%rdi, %r15
000000000006ed72	callq	__ZN23OZChannelGradientSample4copyEPK13OZChannelBaseb ## OZChannelGradientSample::copy(OZChannelBase const*, bool)
000000000006ed77	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
000000000006ed7e	leaq	__ZTI28OZChannelGradientSampleAlpha(%rip), %rdx ## typeinfo for OZChannelGradientSampleAlpha
000000000006ed85	movq	%r14, %rdi
000000000006ed88	xorl	%ecx, %ecx
000000000006ed8a	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
000000000006ed8f	movl	$0x2b0, %esi                    ## imm = 0x2B0
000000000006ed94	addq	%rsi, %r15
000000000006ed97	addq	%rax, %rsi
000000000006ed9a	movq	%r15, %rdi
000000000006ed9d	movl	%ebx, %edx
000000000006ed9f	addq	$0x8, %rsp
000000000006eda3	popq	%rbx
000000000006eda4	popq	%r14
000000000006eda6	popq	%r15
000000000006eda8	popq	%rbp
000000000006eda9	jmp	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
