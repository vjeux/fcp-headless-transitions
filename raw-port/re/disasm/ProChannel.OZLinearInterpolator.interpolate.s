
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000044ec8 <__ZN20OZLinearInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb>:
   44ec8: 55                           	pushq	%rbp
   44ec9: 48 89 e5                     	movq	%rsp, %rbp
   44ecc: 41 57                        	pushq	%r15
   44ece: 41 56                        	pushq	%r14
   44ed0: 41 55                        	pushq	%r13
   44ed2: 41 54                        	pushq	%r12
   44ed4: 53                           	pushq	%rbx
   44ed5: 48 81 ec f8 00 00 00         	subq	$0xf8, %rsp
   44edc: 4c 89 4d b0                  	movq	%r9, -0x50(%rbp)
   44ee0: 4c 89 c3                     	movq	%r8, %rbx
   44ee3: 49 89 cf                     	movq	%rcx, %r15
   44ee6: 48 89 55 88                  	movq	%rdx, -0x78(%rbp)
   44eea: 49 89 f6                     	movq	%rsi, %r14
   44eed: 49 89 fd                     	movq	%rdi, %r13
   44ef0: 48 8b 41 20                  	movq	0x20(%rcx), %rax
   44ef4: 48 89 45 d0                  	movq	%rax, -0x30(%rbp)
   44ef8: 0f 10 41 10                  	movups	0x10(%rcx), %xmm0
   44efc: 0f 29 45 c0                  	movaps	%xmm0, -0x40(%rbp)
   44f00: 49 8b 40 20                  	movq	0x20(%r8), %rax
   44f04: 48 89 45 a0                  	movq	%rax, -0x60(%rbp)
   44f08: 41 0f 10 40 10               	movups	0x10(%r8), %xmm0
   44f0d: 0f 29 45 90                  	movaps	%xmm0, -0x70(%rbp)
   44f11: 49 8b 40 20                  	movq	0x20(%r8), %rax
   44f15: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   44f1a: 41 0f 10 40 10               	movups	0x10(%r8), %xmm0
   44f1f: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   44f24: 48 8b 41 20                  	movq	0x20(%rcx), %rax
   44f28: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   44f2d: 0f 10 41 10                  	movups	0x10(%rcx), %xmm0
   44f31: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   44f35: e8 46 7b 06 00               	callq	0xaca80 <_tan+0xaca80>
   44f3a: 85 c0                        	testl	%eax, %eax
   44f3c: 7e 40                        	jle	0x44f7e <__ZN20OZLinearInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0xb6>
   44f3e: 4c 8d a5 10 ff ff ff         	leaq	-0xf0(%rbp), %r12
   44f45: 4c 89 e7                     	movq	%r12, %rdi
   44f48: 4c 89 f6                     	movq	%r14, %rsi
   44f4b: e8 02 af fe ff               	callq	0x2fe52 <__ZNK8OZSpline14getSmallDeltaUEv>
   44f50: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   44f55: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   44f5a: 41 0f 10 04 24               	movups	(%r12), %xmm0
   44f5f: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   44f64: 48 8b 45 d0                  	movq	-0x30(%rbp), %rax
   44f68: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   44f6d: 0f 28 45 c0                  	movaps	-0x40(%rbp), %xmm0
   44f71: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   44f75: 48 8d 7d 90                  	leaq	-0x70(%rbp), %rdi
   44f79: e8 56 7b 06 00               	callq	0xacad4 <_tan+0xacad4>
   44f7e: 49 8b 45 00                  	movq	(%r13), %rax
   44f82: 4c 8d a5 10 ff ff ff         	leaq	-0xf0(%rbp), %r12
   44f89: 4c 89 e7                     	movq	%r12, %rdi
   44f8c: 4c 89 ee                     	movq	%r13, %rsi
   44f8f: 4c 89 f2                     	movq	%r14, %rdx
   44f92: 48 8b 4d b0                  	movq	-0x50(%rbp), %rcx
   44f96: 4d 89 f8                     	movq	%r15, %r8
   44f99: 49 89 d9                     	movq	%rbx, %r9
   44f9c: ff 50 68                     	callq	*0x68(%rax)
   44f9f: 48 8b 45 a0                  	movq	-0x60(%rbp), %rax
   44fa3: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   44fa8: 0f 28 45 90                  	movaps	-0x70(%rbp), %xmm0
   44fac: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   44fb1: 48 8b 45 d0                  	movq	-0x30(%rbp), %rax
   44fb5: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   44fba: 0f 28 45 c0                  	movaps	-0x40(%rbp), %xmm0
   44fbe: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   44fc2: 4c 8d b5 28 ff ff ff         	leaq	-0xd8(%rbp), %r14
   44fc9: 4c 89 f7                     	movq	%r14, %rdi
   44fcc: e8 09 7b 06 00               	callq	0xacada <_tan+0xacada>
   44fd1: 49 8b 46 10                  	movq	0x10(%r14), %rax
   44fd5: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   44fda: 66 41 0f 10 06               	movupd	(%r14), %xmm0
   44fdf: 66 0f 11 04 24               	movupd	%xmm0, (%rsp)
   44fe4: e8 a3 7a 06 00               	callq	0xaca8c <_tan+0xaca8c>
   44fe9: 66 0f 28 0d 4f b6 06 00      	movapd	0x6b64f(%rip), %xmm1    ## 0xb0640 <__ZTS15OZDynamicSpline+0x64>
   44ff1: 66 0f 29 85 40 ff ff ff      	movapd	%xmm0, -0xc0(%rbp)
   44ff9: 66 0f 57 c8                  	xorpd	%xmm0, %xmm1
   44ffd: 66 0f 29 4d b0               	movapd	%xmm1, -0x50(%rbp)
   45002: 48 8b 45 a0                  	movq	-0x60(%rbp), %rax
   45006: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   4500b: 0f 28 45 90                  	movaps	-0x70(%rbp), %xmm0
   4500f: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   45014: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   45019: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   4501e: 41 0f 10 04 24               	movups	(%r12), %xmm0
   45023: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   45027: 4c 89 f7                     	movq	%r14, %rdi
   4502a: e8 ab 7a 06 00               	callq	0xacada <_tan+0xacada>
   4502f: 49 8b 46 10                  	movq	0x10(%r14), %rax
   45033: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   45038: 41 0f 10 06                  	movups	(%r14), %xmm0
   4503c: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   45040: e8 47 7a 06 00               	callq	0xaca8c <_tan+0xaca8c>
   45045: 0f 29 85 50 ff ff ff         	movaps	%xmm0, -0xb0(%rbp)
   4504c: 48 8b 45 d0                  	movq	-0x30(%rbp), %rax
   45050: 48 89 44 24 28               	movq	%rax, 0x28(%rsp)
   45055: 0f 28 45 c0                  	movaps	-0x40(%rbp), %xmm0
   45059: 0f 11 44 24 18               	movups	%xmm0, 0x18(%rsp)
   4505e: 49 8b 44 24 10               	movq	0x10(%r12), %rax
   45063: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   45068: 41 0f 10 04 24               	movups	(%r12), %xmm0
   4506d: 0f 11 04 24                  	movups	%xmm0, (%rsp)
   45071: 4c 89 f7                     	movq	%r14, %rdi
   45074: e8 61 7a 06 00               	callq	0xacada <_tan+0xacada>
   45079: 49 8b 46 10                  	movq	0x10(%r14), %rax
   4507d: 48 89 44 24 10               	movq	%rax, 0x10(%rsp)
   45082: 66 41 0f 10 06               	movupd	(%r14), %xmm0
   45087: 66 0f 11 04 24               	movupd	%xmm0, (%rsp)
   4508c: e8 fb 79 06 00               	callq	0xaca8c <_tan+0xaca8c>
   45091: 66 0f 29 85 60 ff ff ff      	movapd	%xmm0, -0xa0(%rbp)
   45099: 49 8b 07                     	movq	(%r15), %rax
   4509c: 4c 89 ff                     	movq	%r15, %rdi
   4509f: 4c 8b 75 88                  	movq	-0x78(%rbp), %r14
   450a3: 4c 89 f6                     	movq	%r14, %rsi
   450a6: ff 50 18                     	callq	*0x18(%rax)
   450a9: 66 0f 29 85 70 ff ff ff      	movapd	%xmm0, -0x90(%rbp)
   450b1: 48 8b 03                     	movq	(%rbx), %rax
   450b4: 48 89 df                     	movq	%rbx, %rdi
   450b7: 4c 89 f6                     	movq	%r14, %rsi
   450ba: ff 50 18                     	callq	*0x18(%rax)
   450bd: 80 7d 18 00                  	cmpb	$0x0, 0x18(%rbp)
   450c1: 75 3b                        	jne	0x450fe <__ZN20OZLinearInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x236>
   450c3: 66 0f 28 95 50 ff ff ff      	movapd	-0xb0(%rbp), %xmm2
   450cb: 66 0f 14 95 60 ff ff ff      	unpcklpd	-0xa0(%rbp), %xmm2      ## xmm2 = xmm2[0],mem[0]
   450d3: 66 0f 28 8d 40 ff ff ff      	movapd	-0xc0(%rbp), %xmm1
   450db: 66 0f 14 4d b0               	unpcklpd	-0x50(%rbp), %xmm1      ## xmm1 = xmm1[0],mem[0]
   450e0: 66 0f 5e d1                  	divpd	%xmm1, %xmm2
   450e4: 66 0f 28 8d 70 ff ff ff      	movapd	-0x90(%rbp), %xmm1
   450ec: 66 0f 14 c8                  	unpcklpd	%xmm0, %xmm1            ## xmm1 = xmm1[0],xmm0[0]
   450f0: 66 0f 59 ca                  	mulpd	%xmm2, %xmm1
   450f4: 66 0f 7c c9                  	haddpd	%xmm1, %xmm1
   450f8: 66 0f 28 c1                  	movapd	%xmm1, %xmm0
   450fc: eb 0d                        	jmp	0x4510b <__ZN20OZLinearInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb+0x243>
   450fe: f2 0f 5c 85 70 ff ff ff      	subsd	-0x90(%rbp), %xmm0
   45106: f2 0f 5e 45 b0               	divsd	-0x50(%rbp), %xmm0
   4510b: 48 81 c4 f8 00 00 00         	addq	$0xf8, %rsp
   45112: 5b                           	popq	%rbx
   45113: 41 5c                        	popq	%r12
   45115: 41 5d                        	popq	%r13
   45117: 41 5e                        	popq	%r14
   45119: 41 5f                        	popq	%r15
   4511b: 5d                           	popq	%rbp
   4511c: c3                           	retq
   4511d: 90                           	nop
