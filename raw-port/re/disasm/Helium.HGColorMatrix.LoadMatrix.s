__ZN13HGColorMatrix10LoadMatrixEPK5HGVecb:
00000000001b8150	pushq	%rbp
00000000001b8151	movq	%rsp, %rbp
00000000001b8154	movaps	(%rsi), %xmm0
00000000001b8157	testl	%edx, %edx
00000000001b8159	je	0x1b81a9
00000000001b815b	movaps	0x10(%rsi), %xmm2
00000000001b815f	movaps	0x20(%rsi), %xmm1
00000000001b8163	movaps	0x30(%rsi), %xmm3
00000000001b8167	movaps	%xmm0, %xmm4
00000000001b816a	unpcklps	%xmm2, %xmm4                    ## xmm4 = xmm4[0],xmm2[0],xmm4[1],xmm2[1]
00000000001b816d	movaps	%xmm1, %xmm5
00000000001b8170	unpcklps	%xmm3, %xmm5                    ## xmm5 = xmm5[0],xmm3[0],xmm5[1],xmm3[1]
00000000001b8173	unpckhps	%xmm2, %xmm0                    ## xmm0 = xmm0[2],xmm2[2],xmm0[3],xmm2[3]
00000000001b8176	unpckhps	%xmm3, %xmm1                    ## xmm1 = xmm1[2],xmm3[2],xmm1[3],xmm3[3]
00000000001b8179	movaps	%xmm4, %xmm2
00000000001b817c	movlhps	%xmm5, %xmm2                    ## xmm2 = xmm2[0],xmm5[0]
00000000001b817f	movaps	%xmm2, 0x1b0(%rdi)
00000000001b8186	movhlps	%xmm4, %xmm5                    ## xmm5 = xmm4[1],xmm5[1]
00000000001b8189	movaps	%xmm5, 0x1c0(%rdi)
00000000001b8190	movaps	%xmm0, %xmm2
00000000001b8193	movlhps	%xmm1, %xmm2                    ## xmm2 = xmm2[0],xmm1[0]
00000000001b8196	movaps	%xmm2, 0x1d0(%rdi)
00000000001b819d	movhlps	%xmm0, %xmm1                    ## xmm1 = xmm0[1],xmm1[1]
00000000001b81a0	movaps	%xmm1, 0x1e0(%rdi)
00000000001b81a7	popq	%rbp
00000000001b81a8	retq
00000000001b81a9	movaps	%xmm0, 0x1b0(%rdi)
00000000001b81b0	movaps	0x10(%rsi), %xmm0
00000000001b81b4	movaps	%xmm0, 0x1c0(%rdi)
00000000001b81bb	movaps	0x20(%rsi), %xmm0
00000000001b81bf	movaps	%xmm0, 0x1d0(%rdi)
00000000001b81c6	movaps	0x30(%rsi), %xmm1
00000000001b81ca	movaps	%xmm1, 0x1e0(%rdi)
00000000001b81d1	popq	%rbp
00000000001b81d2	retq
00000000001b81d3	nopw	%cs:(%rax,%rax)
