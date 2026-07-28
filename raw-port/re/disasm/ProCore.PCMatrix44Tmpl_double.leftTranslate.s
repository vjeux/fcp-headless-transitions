__ZN14PCMatrix44TmplIdE13leftTranslateEddd:
000000000004f378	pushq	%rbp
000000000004f379	movq	%rsp, %rbp
000000000004f37c	xorpd	%xmm3, %xmm3
000000000004f380	ucomisd	%xmm3, %xmm0
000000000004f384	jne	0x4f388
000000000004f386	jnp	0x4f3b8
000000000004f388	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000004f38c	movupd	(%rdi), %xmm4
000000000004f390	movupd	0x10(%rdi), %xmm5
000000000004f395	movupd	0x60(%rdi), %xmm6
000000000004f39a	movupd	0x70(%rdi), %xmm7
000000000004f39f	mulpd	%xmm0, %xmm6
000000000004f3a3	addpd	%xmm4, %xmm6
000000000004f3a7	movupd	%xmm6, (%rdi)
000000000004f3ab	mulpd	%xmm0, %xmm7
000000000004f3af	addpd	%xmm5, %xmm7
000000000004f3b3	movupd	%xmm7, 0x10(%rdi)
000000000004f3b8	ucomisd	%xmm3, %xmm1
000000000004f3bc	jne	0x4f3c0
000000000004f3be	jnp	0x4f3f2
000000000004f3c0	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
000000000004f3c4	movupd	0x20(%rdi), %xmm1
000000000004f3c9	movupd	0x30(%rdi), %xmm3
000000000004f3ce	movupd	0x60(%rdi), %xmm4
000000000004f3d3	movupd	0x70(%rdi), %xmm5
000000000004f3d8	mulpd	%xmm0, %xmm4
000000000004f3dc	addpd	%xmm1, %xmm4
000000000004f3e0	movupd	%xmm4, 0x20(%rdi)
000000000004f3e5	mulpd	%xmm0, %xmm5
000000000004f3e9	addpd	%xmm3, %xmm5
000000000004f3ed	movupd	%xmm5, 0x30(%rdi)
000000000004f3f2	xorpd	%xmm0, %xmm0
000000000004f3f6	ucomisd	%xmm0, %xmm2
000000000004f3fa	jne	0x4f3fe
000000000004f3fc	jnp	0x4f430
000000000004f3fe	movddup	%xmm2, %xmm0                    ## xmm0 = xmm2[0,0]
000000000004f402	movupd	0x40(%rdi), %xmm1
000000000004f407	movupd	0x50(%rdi), %xmm2
000000000004f40c	movupd	0x60(%rdi), %xmm3
000000000004f411	movupd	0x70(%rdi), %xmm4
000000000004f416	mulpd	%xmm0, %xmm3
000000000004f41a	addpd	%xmm1, %xmm3
000000000004f41e	movupd	%xmm3, 0x40(%rdi)
000000000004f423	mulpd	%xmm0, %xmm4
000000000004f427	addpd	%xmm2, %xmm4
000000000004f42b	movupd	%xmm4, 0x50(%rdi)
000000000004f430	popq	%rbp
000000000004f431	retq
