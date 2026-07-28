__ZN12PCMaskBuffer7deallocEv:
00000000000c48cc	pushq	%rbp
00000000000c48cd	movq	%rsp, %rbp
00000000000c48d0	pushq	%rbx
00000000000c48d1	pushq	%rax
00000000000c48d2	movq	%rdi, %rbx
00000000000c48d5	movq	(%rdi), %rdi
00000000000c48d8	testq	%rdi, %rdi
00000000000c48db	je	0xc48e2
00000000000c48dd	callq	0xde6ba                         ## symbol stub for: __ZdaPv
00000000000c48e2	xorps	%xmm0, %xmm0
00000000000c48e5	movups	%xmm0, 0x10(%rbx)
00000000000c48e9	movups	%xmm0, (%rbx)
00000000000c48ec	movl	$0x0, 0x20(%rbx)
00000000000c48f3	addq	$0x8, %rsp
00000000000c48f7	popq	%rbx
00000000000c48f8	popq	%rbp
00000000000c48f9	retq
