0000000000613f9e	testq	%rdi, %rdi
0000000000613fa1	je	0x613fda
0000000000613fa3	movq	%rdi, %rsi
0000000000613fa6	movq	0x15a7443(%rip), %rdx
0000000000613fad	movq	-0x10(%rbp), %rax
0000000000613fb1	movq	%rax, 0x10(%rsp)
0000000000613fb6	movaps	-0x20(%rbp), %xmm0
0000000000613fba	movups	%xmm0, (%rsp)
0000000000613fbe	leaq	-0x40(%rbp), %rdi
0000000000613fc2	callq	0x1497986                       ## symbol stub for: _objc_msgSend_stret
0000000000613fc7	movsd	-0x28(%rbp), %xmm0
0000000000613fcc	mulsd	0xf58b04(%rip), %xmm0
0000000000613fd4	addq	$0x60, %rsp
0000000000613fd8	popq	%rbp
0000000000613fd9	retq
0000000000613fda	xorps	%xmm0, %xmm0
0000000000613fdd	addq	$0x60, %rsp
0000000000613fe1	popq	%rbp
0000000000613fe2	retq
0000000000613fe3	nopw	%cs:(%rax,%rax)
__Z24SetDoubleValueForChannelI11OZChannel2DEvRT_dRK6CMTimeb:
0000000000613ff0	pushq	%rbp
0000000000613ff1	movq	%rsp, %rbp
0000000000613ff4	pushq	%r15
0000000000613ff6	pushq	%r14
0000000000613ff8	pushq	%r12
0000000000613ffa	pushq	%rbx
0000000000613ffb	subq	$0x20, %rsp
0000000000613fff	movl	%edx, %r14d
0000000000614002	movq	%rsi, %rdx
0000000000614005	movsd	%xmm0, -0x28(%rbp)
