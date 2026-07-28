__ZN14HGLinearFilter4rectEfff:
000000000010f0c0	pushq	%rbp
000000000010f0c1	movq	%rsp, %rbp
000000000010f0c4	andps	0x2b8b65(%rip), %xmm0
000000000010f0cb	movss	0x2b8bed(%rip), %xmm1
000000000010f0d3	cmpltss	%xmm1, %xmm0
000000000010f0d8	andps	%xmm1, %xmm0
000000000010f0db	popq	%rbp
000000000010f0dc	retq
000000000010f0dd	nopl	(%rax)
