__ZN27OZChannelGradientPositioned4copyEPK13OZChannelBaseb:
000000000006d834	pushq	%rbp
000000000006d835	movq	%rsp, %rbp
000000000006d838	pushq	%r15
000000000006d83a	pushq	%r14
000000000006d83c	pushq	%rbx
000000000006d83d	pushq	%rax
000000000006d83e	movl	%edx, %r14d
000000000006d841	movq	%rsi, %r15
000000000006d844	movq	%rdi, %rbx
000000000006d847	callq	__ZN23OZChannelGradientExtras4copyEPK13OZChannelBaseb ## OZChannelGradientExtras::copy(OZChannelBase const*, bool)
000000000006d84c	testq	%r15, %r15
000000000006d84f	je	0x6d86e
000000000006d851	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
000000000006d858	leaq	__ZTI27OZChannelGradientPositioned(%rip), %rdx ## typeinfo for OZChannelGradientPositioned
000000000006d85f	movq	%r15, %rdi
000000000006d862	xorl	%ecx, %ecx
000000000006d864	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
000000000006d869	movq	%rax, %r15
000000000006d86c	jmp	0x6d871
000000000006d86e	xorl	%r15d, %r15d
000000000006d871	movl	$0x420, %esi                    ## imm = 0x420
000000000006d876	leaq	(%rbx,%rsi), %rdi
000000000006d87a	addq	%r15, %rsi
000000000006d87d	movzbl	%r14b, %r14d
000000000006d881	movl	%r14d, %edx
000000000006d884	callq	__ZN17OZChannelPosition4copyEPK13OZChannelBaseb ## OZChannelPosition::copy(OZChannelBase const*, bool)
000000000006d889	movl	$0x6e0, %eax                    ## imm = 0x6E0
000000000006d88e	addq	%rax, %rbx
000000000006d891	addq	%rax, %r15
000000000006d894	movq	%rbx, %rdi
000000000006d897	movq	%r15, %rsi
000000000006d89a	movl	%r14d, %edx
000000000006d89d	addq	$0x8, %rsp
000000000006d8a1	popq	%rbx
000000000006d8a2	popq	%r14
000000000006d8a4	popq	%r15
000000000006d8a6	popq	%rbp
000000000006d8a7	jmp	__ZN17OZChannelPosition4copyEPK13OZChannelBaseb ## OZChannelPosition::copy(OZChannelBase const*, bool)
