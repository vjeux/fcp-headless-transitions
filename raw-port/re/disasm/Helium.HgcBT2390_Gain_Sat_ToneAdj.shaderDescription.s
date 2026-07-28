__ZNK26HgcBT2390_Gain_Sat_ToneAdj17shaderDescriptionEv:
000000000035e2a0	pushq	%rbp
000000000035e2a1	movq	%rsp, %rbp
000000000035e2a4	pushq	%rbx
000000000035e2a5	pushq	%rax
000000000035e2a6	movq	%rdi, %rbx
000000000035e2a9	movl	$0x28, %edi
000000000035e2ae	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000035e2b3	movq	%rax, 0x10(%rbx)
000000000035e2b7	movq	$0x29, (%rbx)
000000000035e2be	movq	$0x21, 0x8(%rbx)
000000000035e2c6	movups	0x655425(%rip), %xmm0           ## literal pool for: "at_ToneAdj [hgc1]"
000000000035e2cd	movups	%xmm0, 0x10(%rax)
000000000035e2d1	movups	0x65540a(%rip), %xmm0           ## literal pool for: "HgcBT2390_Gain_Sat_ToneAdj [hgc1]"
000000000035e2d8	movups	%xmm0, (%rax)
000000000035e2db	movw	$0x5d, 0x20(%rax)
000000000035e2e1	movq	%rbx, %rax
000000000035e2e4	addq	$0x8, %rsp
000000000035e2e8	popq	%rbx
000000000035e2e9	popq	%rbp
000000000035e2ea	retq
000000000035e2eb	nopl	(%rax,%rax)
