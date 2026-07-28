__ZNK42HgcApply3DLUTTetrahedralUniform_basekernel17shaderDescriptionEv:
0000000000399210	pushq	%rbp
0000000000399211	movq	%rsp, %rbp
0000000000399214	pushq	%rbx
0000000000399215	pushq	%rax
0000000000399216	movq	%rdi, %rbx
0000000000399219	movl	$0x38, %edi
000000000039921e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000399223	movq	%rax, 0x10(%rbx)
0000000000399227	movq	$0x39, (%rbx)
000000000039922e	movq	$0x31, 0x8(%rbx)
0000000000399236	movups	0x63ca00(%rip), %xmm0           ## literal pool for: "basekernel [hgc1]"
000000000039923d	movups	%xmm0, 0x20(%rax)
0000000000399241	movups	0x63c9e5(%rip), %xmm0           ## literal pool for: "rahedralUniform_basekernel [hgc1]"
0000000000399248	movups	%xmm0, 0x10(%rax)
000000000039924c	movups	0x63c9ca(%rip), %xmm0           ## literal pool for: "HgcApply3DLUTTetrahedralUniform_basekernel [hgc1]"
0000000000399253	movups	%xmm0, (%rax)
0000000000399256	movw	$0x5d, 0x30(%rax)
000000000039925c	movq	%rbx, %rax
000000000039925f	addq	$0x8, %rsp
0000000000399263	popq	%rbx
0000000000399264	popq	%rbp
0000000000399265	retq
0000000000399266	nopw	%cs:(%rax,%rax)
