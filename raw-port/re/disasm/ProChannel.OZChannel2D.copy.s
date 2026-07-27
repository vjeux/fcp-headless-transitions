__ZN11OZChannel2D4copyEPK13OZChannelBaseb:
000000000004795a	pushq	%rbp
000000000004795b	movq	%rsp, %rbp
000000000004795e	pushq	%r15
0000000000047960	pushq	%r14
0000000000047962	pushq	%rbx
0000000000047963	pushq	%rax
0000000000047964	movl	%edx, %r14d
0000000000047967	movq	%rsi, %r15
000000000004796a	movq	%rdi, %rbx
000000000004796d	callq	__ZN17OZCompoundChannel4copyEPK13OZChannelBaseb ## OZCompoundChannel::copy(OZChannelBase const*, bool)
0000000000047972	testq	%r15, %r15
0000000000047975	je	0x47994
0000000000047977	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
000000000004797e	leaq	__ZTI11OZChannel2D(%rip), %rdx  ## typeinfo for OZChannel2D
0000000000047985	movq	%r15, %rdi
0000000000047988	xorl	%ecx, %ecx
000000000004798a	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
000000000004798f	movq	%rax, %r15
0000000000047992	jmp	0x47997
0000000000047994	xorl	%r15d, %r15d
0000000000047997	movl	$0x88, %esi
000000000004799c	leaq	(%rbx,%rsi), %rdi
00000000000479a0	addq	%r15, %rsi
00000000000479a3	movzbl	%r14b, %r14d
00000000000479a7	movl	%r14d, %edx
00000000000479aa	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
00000000000479af	movl	$0x120, %eax                    ## imm = 0x120
00000000000479b4	addq	%rax, %rbx
00000000000479b7	addq	%rax, %r15
00000000000479ba	movq	%rbx, %rdi
00000000000479bd	movq	%r15, %rsi
00000000000479c0	movl	%r14d, %edx
00000000000479c3	addq	$0x8, %rsp
00000000000479c7	popq	%rbx
00000000000479c8	popq	%r14
00000000000479ca	popq	%r15
00000000000479cc	popq	%rbp
00000000000479cd	jmp	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
