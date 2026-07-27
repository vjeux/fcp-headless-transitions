__ZN11OZChannel3D4copyEPK13OZChannelBaseb:
00000000000491a4	pushq	%rbp
00000000000491a5	movq	%rsp, %rbp
00000000000491a8	pushq	%r15
00000000000491aa	pushq	%r14
00000000000491ac	pushq	%rbx
00000000000491ad	pushq	%rax
00000000000491ae	movl	%edx, %ebx
00000000000491b0	movq	%rsi, %r14
00000000000491b3	movq	%rdi, %r15
00000000000491b6	callq	__ZN11OZChannel2D4copyEPK13OZChannelBaseb ## OZChannel2D::copy(OZChannelBase const*, bool)
00000000000491bb	leaq	__ZTI13OZChannelBase(%rip), %rsi ## typeinfo for OZChannelBase
00000000000491c2	leaq	__ZTI11OZChannel3D(%rip), %rdx  ## typeinfo for OZChannel3D
00000000000491c9	movq	%r14, %rdi
00000000000491cc	xorl	%ecx, %ecx
00000000000491ce	callq	0xacea0                         ## symbol stub for: ___dynamic_cast
00000000000491d3	movl	$0x1b8, %esi                    ## imm = 0x1B8
00000000000491d8	addq	%rsi, %r15
00000000000491db	addq	%rax, %rsi
00000000000491de	movq	%r15, %rdi
00000000000491e1	movl	%ebx, %edx
00000000000491e3	addq	$0x8, %rsp
00000000000491e7	popq	%rbx
00000000000491e8	popq	%r14
00000000000491ea	popq	%r15
00000000000491ec	popq	%rbp
00000000000491ed	jmp	__ZN9OZChannel4copyEPK13OZChannelBaseb ## OZChannel::copy(OZChannelBase const*, bool)
