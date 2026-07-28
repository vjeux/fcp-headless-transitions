__ZNK39HgcAVASpatialAverageAdaptive_LowerField17shaderDescriptionEv:
000000000021d670	pushq	%rbp
000000000021d671	movq	%rsp, %rbp
000000000021d674	pushq	%rbx
000000000021d675	pushq	%rax
000000000021d676	movq	%rdi, %rbx
000000000021d679	movl	$0x30, %edi
000000000021d67e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000021d683	movq	%rax, 0x10(%rbx)
000000000021d687	movq	$0x31, (%rbx)
000000000021d68e	movq	$0x2e, 0x8(%rbx)
000000000021d696	movups	0x6eece3(%rip), %xmm0           ## literal pool for: "owerField [hgc1]"
000000000021d69d	movups	%xmm0, 0x1e(%rax)
000000000021d6a1	movups	0x6eecca(%rip), %xmm0           ## literal pool for: "rageAdaptive_LowerField [hgc1]"
000000000021d6a8	movups	%xmm0, 0x10(%rax)
000000000021d6ac	movups	0x6eecaf(%rip), %xmm0           ## literal pool for: "HgcAVASpatialAverageAdaptive_LowerField [hgc1]"
000000000021d6b3	movups	%xmm0, (%rax)
000000000021d6b6	movb	$0x0, 0x2e(%rax)
000000000021d6ba	movq	%rbx, %rax
000000000021d6bd	addq	$0x8, %rsp
000000000021d6c1	popq	%rbx
000000000021d6c2	popq	%rbp
000000000021d6c3	retq
000000000021d6c4	nopw	%cs:(%rax,%rax)
