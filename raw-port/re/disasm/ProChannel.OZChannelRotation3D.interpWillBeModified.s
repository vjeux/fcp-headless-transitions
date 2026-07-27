__ZN19OZChannelRotation3D20interpWillBeModifiedEj:
00000000000816fc	pushq	%rbp
00000000000816fd	movq	%rsp, %rbp
0000000000081700	pushq	%r14
0000000000081702	pushq	%rbx
0000000000081703	movl	%esi, %ebx
0000000000081705	movq	%rdi, %r14
0000000000081708	addq	$0x88, %rdi
000000000008170f	callq	__ZN9OZChannel20parentWillBeModifiedEj ## OZChannel::parentWillBeModified(unsigned int)
0000000000081714	leaq	0x120(%r14), %rdi
000000000008171b	movl	%ebx, %esi
000000000008171d	callq	__ZN9OZChannel20parentWillBeModifiedEj ## OZChannel::parentWillBeModified(unsigned int)
0000000000081722	addq	$0x1b8, %r14                    ## imm = 0x1B8
0000000000081729	movq	%r14, %rdi
000000000008172c	movl	%ebx, %esi
000000000008172e	popq	%rbx
000000000008172f	popq	%r14
0000000000081731	popq	%rbp
0000000000081732	jmp	__ZN9OZChannel20parentWillBeModifiedEj ## OZChannel::parentWillBeModified(unsigned int)
0000000000081737	nop
