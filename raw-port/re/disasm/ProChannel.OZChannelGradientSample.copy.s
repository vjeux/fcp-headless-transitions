__ZN23OZChannelGradientSample4copyEPK13OZChannelBaseb:
000000000006e2e0	pushq	%rbp
000000000006e2e1	movq	%rsp, %rbp
000000000006e2e4	pushq	%r15
000000000006e2e6	pushq	%r14
000000000006e2e8	pushq	%rbx
000000000006e2e9	pushq	%rax
000000000006e2ea	movl	%edx, %r14d
000000000006e2ed	movq	%rsi, %r15
000000000006e2f0	movq	%rdi, %rbx
000000000006e2f3	callq	__ZN15OZChannelFolder4copyEPK13OZChannelBaseb ## OZChannelFolder::copy(OZChannelBase const*, bool)
000000000006e2f8	testq	%r15, %r15
000000000006e2fb	je	0x6e31a
000000000006e2fd	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
000000000006e304	leaq	__ZTI23OZChannelGradientSample(%rip), %rdx ## typeinfo for OZChannelGradientSample
000000000006e30b	movq	%r15, %rdi
000000000006e30e	xorl	%ecx, %ecx
000000000006e310	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
000000000006e315	movq	%rax, %r15
000000000006e318	jmp	0x6e31d
000000000006e31a	xorl	%r15d, %r15d
000000000006e31d	movl	$0x80, %esi
000000000006e322	leaq	(%rbx,%rsi), %rdi
000000000006e326	addq	%r15, %rsi
000000000006e329	movzbl	%r14b, %r14d
000000000006e32d	movl	%r14d, %edx
000000000006e330	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
000000000006e335	movl	$0x118, %esi                    ## imm = 0x118
000000000006e33a	leaq	(%rbx,%rsi), %rdi
000000000006e33e	addq	%r15, %rsi
000000000006e341	movl	%r14d, %edx
000000000006e344	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
000000000006e349	movl	$0x1b0, %eax                    ## imm = 0x1B0
000000000006e34e	addq	%rax, %rbx
000000000006e351	addq	%rax, %r15
000000000006e354	movq	%rbx, %rdi
000000000006e357	movq	%r15, %rsi
000000000006e35a	movl	%r14d, %edx
000000000006e35d	addq	$0x8, %rsp
000000000006e361	popq	%rbx
000000000006e362	popq	%r14
000000000006e364	popq	%r15
000000000006e366	popq	%rbp
000000000006e367	jmp	__ZN13OZChannelEnum4copyEPK13OZChannelBaseb ## OZChannelEnum::copy(OZChannelBase const*, bool)
