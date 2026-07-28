__ZN14OZChannelShear4copyEPK13OZChannelBaseb:
0000000000087768	pushq	%rbp
0000000000087769	movq	%rsp, %rbp
000000000008776c	pushq	%r15
000000000008776e	pushq	%r14
0000000000087770	pushq	%rbx
0000000000087771	pushq	%rax
0000000000087772	movl	%edx, %r14d
0000000000087775	movq	%rsi, %r15
0000000000087778	movq	%rdi, %rbx
000000000008777b	callq	__ZN17OZCompoundChannel4copyEPK13OZChannelBaseb ## OZCompoundChannel::copy(OZChannelBase const*, bool)
0000000000087780	testq	%r15, %r15
0000000000087783	je	0x877a2
0000000000087785	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
000000000008778c	leaq	__ZTI14OZChannelShear(%rip), %rdx ## typeinfo for OZChannelShear
0000000000087793	movq	%r15, %rdi
0000000000087796	xorl	%ecx, %ecx
0000000000087798	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
000000000008779d	movq	%rax, %r15
00000000000877a0	jmp	0x877a5
00000000000877a2	xorl	%r15d, %r15d
00000000000877a5	movl	$0x88, %esi
00000000000877aa	leaq	(%rbx,%rsi), %rdi
00000000000877ae	addq	%r15, %rsi
00000000000877b1	movzbl	%r14b, %r14d
00000000000877b5	movl	%r14d, %edx
00000000000877b8	callq	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
00000000000877bd	movl	$0x120, %eax                    ## imm = 0x120
00000000000877c2	addq	%rax, %rbx
00000000000877c5	addq	%rax, %r15
00000000000877c8	movq	%rbx, %rdi
00000000000877cb	movq	%r15, %rsi
00000000000877ce	movl	%r14d, %edx
00000000000877d1	addq	$0x8, %rsp
00000000000877d5	popq	%rbx
00000000000877d6	popq	%r14
00000000000877d8	popq	%r15
00000000000877da	popq	%rbp
00000000000877db	jmp	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
