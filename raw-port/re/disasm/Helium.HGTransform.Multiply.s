__ZN11HGTransform8MultiplyEPKS_:
00000000001b5020	pushq	%rbp
00000000001b5021	movq	%rsp, %rbp
00000000001b5024	testq	%rsi, %rsi
00000000001b5027	je	0x1b523a
00000000001b502d	movddup	0x10(%rdi), %xmm0               ## xmm0 = mem[0,0]
00000000001b5032	movupd	0x10(%rsi), %xmm1
00000000001b5037	movupd	0x20(%rsi), %xmm2
00000000001b503c	movupd	0x30(%rsi), %xmm3
00000000001b5041	movupd	0x40(%rsi), %xmm4
00000000001b5046	mulpd	%xmm0, %xmm1
00000000001b504a	movddup	0x18(%rdi), %xmm5               ## xmm5 = mem[0,0]
00000000001b504f	mulpd	%xmm5, %xmm3
00000000001b5053	addpd	%xmm1, %xmm3
00000000001b5057	movupd	0x50(%rsi), %xmm1
00000000001b505c	movddup	0x20(%rdi), %xmm6               ## xmm6 = mem[0,0]
00000000001b5061	mulpd	%xmm6, %xmm1
00000000001b5065	addpd	%xmm3, %xmm1
00000000001b5069	movupd	0x70(%rsi), %xmm3
00000000001b506e	movddup	0x28(%rdi), %xmm7               ## xmm7 = mem[0,0]
00000000001b5073	mulpd	%xmm7, %xmm3
00000000001b5077	addpd	%xmm1, %xmm3
00000000001b507b	mulpd	%xmm0, %xmm2
00000000001b507f	mulpd	%xmm5, %xmm4
00000000001b5083	addpd	%xmm2, %xmm4
00000000001b5087	movupd	0x60(%rsi), %xmm0
00000000001b508c	mulpd	%xmm6, %xmm0
00000000001b5090	addpd	%xmm4, %xmm0
00000000001b5094	movupd	0x80(%rsi), %xmm1
00000000001b509c	mulpd	%xmm7, %xmm1
00000000001b50a0	addpd	%xmm0, %xmm1
00000000001b50a4	movupd	%xmm3, 0x10(%rdi)
00000000001b50a9	movupd	%xmm1, 0x20(%rdi)
00000000001b50ae	movddup	0x30(%rdi), %xmm0               ## xmm0 = mem[0,0]
00000000001b50b3	movupd	0x10(%rsi), %xmm1
00000000001b50b8	movupd	0x20(%rsi), %xmm2
00000000001b50bd	movupd	0x30(%rsi), %xmm3
00000000001b50c2	movupd	0x40(%rsi), %xmm4
00000000001b50c7	mulpd	%xmm0, %xmm1
00000000001b50cb	movddup	0x38(%rdi), %xmm5               ## xmm5 = mem[0,0]
00000000001b50d0	mulpd	%xmm5, %xmm3
00000000001b50d4	addpd	%xmm1, %xmm3
00000000001b50d8	movupd	0x50(%rsi), %xmm1
00000000001b50dd	movddup	0x40(%rdi), %xmm6               ## xmm6 = mem[0,0]
00000000001b50e2	mulpd	%xmm6, %xmm1
00000000001b50e6	addpd	%xmm3, %xmm1
00000000001b50ea	movupd	0x70(%rsi), %xmm3
00000000001b50ef	movddup	0x48(%rdi), %xmm7               ## xmm7 = mem[0,0]
00000000001b50f4	mulpd	%xmm7, %xmm3
00000000001b50f8	addpd	%xmm1, %xmm3
00000000001b50fc	mulpd	%xmm0, %xmm2
00000000001b5100	mulpd	%xmm5, %xmm4
00000000001b5104	addpd	%xmm2, %xmm4
00000000001b5108	movupd	0x60(%rsi), %xmm0
00000000001b510d	mulpd	%xmm6, %xmm0
00000000001b5111	addpd	%xmm4, %xmm0
00000000001b5115	movupd	0x80(%rsi), %xmm1
00000000001b511d	mulpd	%xmm7, %xmm1
00000000001b5121	addpd	%xmm0, %xmm1
00000000001b5125	movupd	%xmm3, 0x30(%rdi)
00000000001b512a	movupd	%xmm1, 0x40(%rdi)
00000000001b512f	movddup	0x50(%rdi), %xmm0               ## xmm0 = mem[0,0]
00000000001b5134	movupd	0x10(%rsi), %xmm1
00000000001b5139	movupd	0x20(%rsi), %xmm2
00000000001b513e	movupd	0x30(%rsi), %xmm3
00000000001b5143	movupd	0x40(%rsi), %xmm4
00000000001b5148	mulpd	%xmm0, %xmm1
00000000001b514c	movddup	0x58(%rdi), %xmm5               ## xmm5 = mem[0,0]
00000000001b5151	mulpd	%xmm5, %xmm3
00000000001b5155	addpd	%xmm1, %xmm3
00000000001b5159	movupd	0x50(%rsi), %xmm1
00000000001b515e	movddup	0x60(%rdi), %xmm6               ## xmm6 = mem[0,0]
00000000001b5163	mulpd	%xmm6, %xmm1
00000000001b5167	addpd	%xmm3, %xmm1
00000000001b516b	movupd	0x70(%rsi), %xmm3
00000000001b5170	movddup	0x68(%rdi), %xmm7               ## xmm7 = mem[0,0]
00000000001b5175	mulpd	%xmm7, %xmm3
00000000001b5179	addpd	%xmm1, %xmm3
00000000001b517d	mulpd	%xmm0, %xmm2
00000000001b5181	mulpd	%xmm5, %xmm4
00000000001b5185	addpd	%xmm2, %xmm4
00000000001b5189	movupd	0x60(%rsi), %xmm0
00000000001b518e	mulpd	%xmm6, %xmm0
00000000001b5192	addpd	%xmm4, %xmm0
00000000001b5196	movupd	0x80(%rsi), %xmm1
00000000001b519e	mulpd	%xmm7, %xmm1
00000000001b51a2	addpd	%xmm0, %xmm1
00000000001b51a6	movupd	%xmm3, 0x50(%rdi)
00000000001b51ab	movupd	%xmm1, 0x60(%rdi)
00000000001b51b0	movddup	0x70(%rdi), %xmm0               ## xmm0 = mem[0,0]
00000000001b51b5	movupd	0x10(%rsi), %xmm1
00000000001b51ba	movupd	0x20(%rsi), %xmm2
00000000001b51bf	movupd	0x30(%rsi), %xmm3
00000000001b51c4	movupd	0x40(%rsi), %xmm4
00000000001b51c9	mulpd	%xmm0, %xmm1
00000000001b51cd	movddup	0x78(%rdi), %xmm5               ## xmm5 = mem[0,0]
00000000001b51d2	mulpd	%xmm5, %xmm3
00000000001b51d6	addpd	%xmm1, %xmm3
00000000001b51da	movupd	0x50(%rsi), %xmm1
00000000001b51df	movddup	0x80(%rdi), %xmm6               ## xmm6 = mem[0,0]
00000000001b51e7	mulpd	%xmm6, %xmm1
00000000001b51eb	addpd	%xmm3, %xmm1
00000000001b51ef	movupd	0x70(%rsi), %xmm3
00000000001b51f4	movddup	0x88(%rdi), %xmm7               ## xmm7 = mem[0,0]
00000000001b51fc	mulpd	%xmm7, %xmm3
00000000001b5200	addpd	%xmm1, %xmm3
00000000001b5204	mulpd	%xmm0, %xmm2
00000000001b5208	mulpd	%xmm5, %xmm4
00000000001b520c	addpd	%xmm2, %xmm4
00000000001b5210	movupd	0x60(%rsi), %xmm0
00000000001b5215	mulpd	%xmm6, %xmm0
00000000001b5219	addpd	%xmm4, %xmm0
00000000001b521d	movupd	0x80(%rsi), %xmm1
00000000001b5225	mulpd	%xmm7, %xmm1
00000000001b5229	addpd	%xmm0, %xmm1
00000000001b522d	movupd	%xmm3, 0x70(%rdi)
00000000001b5232	movupd	%xmm1, 0x80(%rdi)
00000000001b523a	popq	%rbp
00000000001b523b	retq
00000000001b523c	nopl	(%rax)
