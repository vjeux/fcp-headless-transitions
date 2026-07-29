__ZN24OZChannelHistogramSample4copyEPK13OZChannelBaseb:
00000000000717ec	pushq	%rbp
00000000000717ed	movq	%rsp, %rbp
00000000000717f0	pushq	%r15
00000000000717f2	pushq	%r14
00000000000717f4	pushq	%rbx
00000000000717f5	pushq	%rax
00000000000717f6	movl	%edx, %r15d
00000000000717f9	movq	%rsi, %r14
00000000000717fc	movq	%rdi, %rbx
00000000000717ff	callq	__ZN17OZCompoundChannel4copyEPK13OZChannelBaseb ## OZCompoundChannel::copy(OZChannelBase const*, bool)
0000000000071804	testq	%r14, %r14
0000000000071807	je	0x71826
0000000000071809	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
0000000000071810	leaq	__ZTI24OZChannelHistogramSample(%rip), %rdx ## typeinfo for OZChannelHistogramSample
0000000000071817	movq	%r14, %rdi
000000000007181a	xorl	%ecx, %ecx
000000000007181c	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
0000000000071821	movq	%rax, %r14
0000000000071824	jmp	0x71829
0000000000071826	xorl	%r14d, %r14d
0000000000071829	movl	$0x88, %esi
000000000007182e	leaq	(%rbx,%rsi), %rdi
0000000000071832	addq	%r14, %rsi
0000000000071835	movzbl	%r15b, %r15d
0000000000071839	movl	%r15d, %edx
000000000007183c	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
0000000000071841	movl	$0x120, %esi                    ## imm = 0x120
0000000000071846	leaq	(%rbx,%rsi), %rdi
000000000007184a	addq	%r14, %rsi
000000000007184d	movl	%r15d, %edx
0000000000071850	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
0000000000071855	movl	$0x1b8, %esi                    ## imm = 0x1B8
000000000007185a	leaq	(%rbx,%rsi), %rdi
000000000007185e	addq	%r14, %rsi
0000000000071861	movl	%r15d, %edx
0000000000071864	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
0000000000071869	movl	$0x250, %esi                    ## imm = 0x250
000000000007186e	leaq	(%rbx,%rsi), %rdi
0000000000071872	addq	%r14, %rsi
0000000000071875	movl	%r15d, %edx
0000000000071878	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
000000000007187d	movl	$0x2e8, %eax                    ## imm = 0x2E8
0000000000071882	addq	%rax, %rbx
0000000000071885	addq	%rax, %r14
0000000000071888	movq	%rbx, %rdi
000000000007188b	movq	%r14, %rsi
000000000007188e	movl	%r15d, %edx
0000000000071891	addq	$0x8, %rsp
0000000000071895	popq	%rbx
0000000000071896	popq	%r14
0000000000071898	popq	%r15
000000000007189a	popq	%rbp
000000000007189b	jmp	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
