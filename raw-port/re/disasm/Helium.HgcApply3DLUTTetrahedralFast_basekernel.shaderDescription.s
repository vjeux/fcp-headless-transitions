__ZNK39HgcApply3DLUTTetrahedralFast_basekernel17shaderDescriptionEv:
000000000038a3d0	pushq	%rbp
000000000038a3d1	movq	%rsp, %rbp
000000000038a3d4	pushq	%rbx
000000000038a3d5	pushq	%rax
000000000038a3d6	movq	%rdi, %rbx
000000000038a3d9	movl	$0x30, %edi
000000000038a3de	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000038a3e3	movq	%rax, 0x10(%rbx)
000000000038a3e7	movq	$0x31, (%rbx)
000000000038a3ee	movq	$0x2e, 0x8(%rbx)
000000000038a3f6	movups	0x643d4a(%rip), %xmm0           ## literal pool for: "asekernel [hgc1]"
000000000038a3fd	movups	%xmm0, 0x1e(%rax)
000000000038a401	movups	0x643d31(%rip), %xmm0           ## literal pool for: "rahedralFast_basekernel [hgc1]"
000000000038a408	movups	%xmm0, 0x10(%rax)
000000000038a40c	movups	0x643d16(%rip), %xmm0           ## literal pool for: "HgcApply3DLUTTetrahedralFast_basekernel [hgc1]"
000000000038a413	movups	%xmm0, (%rax)
000000000038a416	movb	$0x0, 0x2e(%rax)
000000000038a41a	movq	%rbx, %rax
000000000038a41d	addq	$0x8, %rsp
000000000038a421	popq	%rbx
000000000038a422	popq	%rbp
000000000038a423	retq
000000000038a424	nopw	%cs:(%rax,%rax)
