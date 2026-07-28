__ZNK20HgcAVAMotionDilation17shaderDescriptionEv:
0000000000215be0	pushq	%rbp
0000000000215be1	movq	%rsp, %rbp
0000000000215be4	pushq	%rbx
0000000000215be5	pushq	%rax
0000000000215be6	movq	%rdi, %rbx
0000000000215be9	movl	$0x20, %edi
0000000000215bee	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000215bf3	movq	%rax, 0x10(%rbx)
0000000000215bf7	movq	$0x21, (%rbx)
0000000000215bfe	movq	$0x1b, 0x8(%rbx)
0000000000215c06	movups	0x6f1f55(%rip), %xmm0           ## literal pool for: "nDilation [hgc1]"
0000000000215c0d	movups	%xmm0, 0xb(%rax)
0000000000215c11	movups	0x6f1f3f(%rip), %xmm0           ## literal pool for: "HgcAVAMotionDilation [hgc1]"
0000000000215c18	movups	%xmm0, (%rax)
0000000000215c1b	movb	$0x0, 0x1b(%rax)
0000000000215c1f	movq	%rbx, %rax
0000000000215c22	addq	$0x8, %rsp
0000000000215c26	popq	%rbx
0000000000215c27	popq	%rbp
0000000000215c28	retq
0000000000215c29	nopl	(%rax)
